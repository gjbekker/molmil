#!
# video_server.py
# 
# Molmil molecular web viewer: https://github.com/gjbekker/molmil
#
# By Gert-Jan Bekker
# License: LGPLv3
#   See https://github.com/gjbekker/molmil/blob/master/LICENCE.md
#
# Requirements: ffmpeg (if not in path, set the FFMPEG variable below) ; output/ folder (alternatively set the OUTPUT variable below)
# Usage: python video_server.py
#        Afterwards from Molmil: Menu --> Save --> MP4 video --> Play & Record

import os, sys, subprocess, random, string, base64, traceback, cgi, re, datetime, time

try: import json
except: import simplejson as json

from wsgiref.simple_server import make_server

videoObjectRef = {}

# if ffmpeg is in the PATH, the following can be used, otherwise supply the /path/to/ffmpeg
FFMPEG = "ffmpeg"
OUTPUT = "output/"

# address and port on which to listen (keep this as it is to keep Molmil working with the default settings)
HOST = ["localhost", 8080]

CWD = os.path.dirname(__file__)

if not CWD.strip(): CWD = os.getcwd()
CWD += os.sep
if CWD.strip() == "" or CWD == "/": CWD = os.getcwd()+os.sep
  
if not os.path.exists(OUTPUT):
  if os.path.exists(CWD+OUTPUT): OUTPUT = CWD+OUTPUT
  else:
    print "Folder does not exist:", OUTPUT
    exit()
  
# builds the video using ffmpeg
class videoObject:
  def __init__(self, id, w, h, rate):
    self.id = id
    
    cmdstring = (FFMPEG,
                 '-r', '%d' % rate,
                 '-f','image2pipe',
                 '-vcodec', 'png',
                 '-i', '-', 
                 '-s', '%sx%s'%(w, h),
                 '-pix_fmt', 'yuv420p',
                 '-an',
                 '-vcodec', 'libx264',
                 OUTPUT+id+".mp4"
                 )
    self.proc = subprocess.Popen(cmdstring, stdin=subprocess.PIPE, stdout=sys.stdout, stderr=sys.stderr)
    
  def addFrame(self, data): 
    self.proc.stdin.write(data)
  
  def finalize(self): 
    self.proc.stdin.close()
    self.proc.wait()

    
# initialized the video generation
def initVideo(__request__, w, h, rate=15):
  if not rate: rate = 15
  while True:
    id = "".join([random.choice(string.letters+string.digits) for i in xrange(8)])
    if not videoObjectRef.has_key(id):
      videoObjectRef[id] = videoObject(id, w, h, int(rate))
      break
  __Headers__(__request__, "application/json")
  return [id]
  
# adds a frame to the video
def addFrame(__request__, id, data):
  __Headers__(__request__, "application/json")
  if videoObjectRef.has_key(id):
    data = data.split(",")[1].strip()
    data = base64.b64decode(data)
    videoObjectRef[id].addFrame(data)
    return ["1"]
  return ["0"]
  
  
# finalizes the video
def deInitVideo(__request__, id):
  __Headers__(__request__, "application/json")
  if videoObjectRef.has_key(id):
    videoObjectRef[id].finalize()
    videoObjectRef.pop(id)
    return [CWD+"output/"+id+".mp4"]
  return ["0"]
  
# gets the video
def getVideo(__request__, id):
  file_handle = open(CWD+"output/"+id+".mp4")
  __Headers__(__request__, "video/mp4")
  return __request__.fileWrapper(file_handle, __request__, 4096)
    
# returns true, indicating to Molmil that the server is running
def has_molmil_video_support(__request__):
  __Headers__(__request__, "application/json")
  out = {"found": True}
  return [json.dumps(out)]
    
# generate return headers
def __Headers__(__request__, ContentType="text/plain", FileName=None, Gzipped=False):
  __request__.responseHeaders = []
  __request__.responseHeaders.append(("Access-Control-Allow-Origin", "*"))
  __request__.responseHeaders.append(("Content-Type", ContentType and str(ContentType) or "text/plain"))
  if FileName: __request__.responseHeaders.append(("Content-disposition", "attachment; filename=\"%s\""%str(FileName)))
  if Gzipped: __request__.responseHeaders.append(("Content-Encoding", "gzip"))

    
# ****************************************************************

def local2UTC(tm): return datetime.datetime.utcfromtimestamp(tm)

# file wrapper object
class fileWrapper:
  def __init__(self, filelike, __request__, blksize=8192, finfo=None):
    self.filelike = filelike
    self.__request__ = __request__
    self.blksize = blksize
    if hasattr(filelike, "close"): self.close = filelike.close
    try:
      if not finfo:finfo = os.fstat(filelike.fileno())
    except: finfo = None
    if finfo: 
      self.length = finfo.st_size
      tm = __request__.environ.get("HTTP_IF_MODIFIED_SINCE", None)
      mtime = local2UTC(finfo.st_mtime)
      if tm:
        try: 
          tm = datetime.datetime(*time.strptime(tm, "%a, %d %b %Y %H:%M:%S GMT")[:6]) # somehow this does not work on firefox & ie...
          if mtime <= tm:
            __request__.status = "304 Not Modified"
            self.__getitem__ = self.__nullGet__
            return None
        except: pass
      __request__.responseHeaders.append(("Last-Modified", mtime.strftime("%a, %d %b %Y %H:%M:%S GMT")))
    
    start = 0
    range_header = __request__.environ.get("HTTP_RANGE", None)
    if range_header and finfo:
      range_header = range_header.replace("bytes=", "")
      m = re.search('(\d+)-(\d+)?', range_header)
      g = m.groups()
      start = 0
      if g[0]: 
        start = int(g[0])
        filelike.seek(start)
        self.length -= start
      if g[1]:
        self.length = int(g[1])-start
        self.__getitem__ = self.__rangeGet__
      else: self.__getitem__ = self.__normalGet__
      __request__.responseHeaders.append(("Content-Range", "bytes %s-%s/%s"%(start, start+self.length-1, finfo.st_size)))
      __request__.status = "206 Partial content"
    else: 
      self.__getitem__ = self.__normalGet__
      __request__.responseHeaders.append(("Accept-Ranges", "bytes"))
    if finfo: __request__.responseHeaders.append(("Content-Length", str(self.length)))
    else: 
      filelike.seek(0, 2)
      __request__.responseHeaders.append(("Content-Length", str(filelike.tell())))
      filelike.seek(0, 0)
    
  def __nullGet__(self, key): raise IndexError  
  
  def __rangeGet__(self, key):
    mx = min(self.blksize, self.length)
    if mx > 0:
      data = self.filelike.read(mx)
      self.length -= mx
      if data: return data
    raise IndexError
 
  def __normalGet__(self, key) :
    data = self.filelike.read(self.blksize)
    if data: return data
    raise IndexError
  
# request object
class requestObject:
  def __init__(self, start_response=None, params=None, environ=None):
    self.responseHeaders = []
    self.dbconnect = None
    self.target = None
    self.openConnections = []
    self.status = "200 OK"
    if params: self.params = params
    else: self.params = {}
    self.start_response = start_response
    self.params["__request__"] = self
    self.environ = environ
    self.fileWrapper = fileWrapper

def extractDataFromFSO(inst):
  try:
    if inst.filename: return [inst.filename, inst.value]
    else: return inst.value
  except: return inst.value

# main function
def application(environ, start_response):
  request = requestObject(environ=environ)
  fs = cgi.FieldStorage(fp=environ["wsgi.input"], environ=environ, keep_blank_values=True)
  for key in fs.keys(): 
    if type(fs[key]) == list: request.params[key] = [extractDataFromFSO(i) for i in fs[key]]
    else: request.params[key] = extractDataFromFSO(fs[key])
    
  request.start_response = start_response
  request.responseHeaders = [('Content-Type', 'text/plain')]
  request.status = "200 OK"
  
  callTo = environ["PATH_INFO"].strip("/")
  
  output = None
  
  try:
    if callTo == "app/has_molmil_video_support": output = has_molmil_video_support(request)
    elif callTo == "app/initVideo": output = initVideo(request, request.params.get("w"), request.params.get("h"), request.params.get("rate"))
    elif callTo == "app/addFrame": output = addFrame(request, request.params.get("id"), request.params.get("data"))
    elif callTo == "app/deInitVideo": output = deInitVideo(request, request.params.get("id"))
    elif callTo == "app/getVideo": output = getVideo(request, request.params.get("id"))
  except:
    tmp = "===-"+time.ctime()+"-"
    tmp = tmp.ljust(128, "=") + "\n"
    tmp += "".join(traceback.format_exception(*sys.exc_info())).strip() + "\n"
    tmp += "".join(["=" for i in range(128)]) + "\n"
    print tmp

  request.start_response(request.status, request.responseHeaders)
  
  if output == None: output = []
  elif isinstance(output, (int, float, long, complex)): output = [str(output)]
  elif type(output) == str: output = [output]
  return output
  
  
if __name__ == "__main__": 
  httpd = make_server(HOST[0], HOST[1], application)
  print "Press Ctrl+C to exit..."
  try: httpd.serve_forever()
  except: pass
