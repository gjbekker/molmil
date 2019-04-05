import sys, struct
from array import array

infl = "5ire.ply"
outfl = "5ire.mpbf"

# mpbf --> Molmil Polygon Binary Format
out = open(outfl, "wb")

# type, nov, noi, name_size, {name_size*char}, {nov*float}, {noi*float}
# the above block can be repeated n times until eof

# 3 --> (x, y, z, nx, ny, nz, rgba) + 3idx
# 2 --> (x, y, z, rgba) + 2idx
# 1 --> (x, y, z, rgba) + 0idx
      
fp = open(infl, "r")
nov, nof = 0, 0
offset = 0
for i in fp.readlines():
  if i[:15] == "element vertex ": nov += int(i[15:].strip())
  if i[:13] == "element face ": nof += int(i[13:].strip())
  offset += len(i)
  if i == "end_header\n": break
fp.close()
  
txt = "".encode("utf-8")
noc = len(txt)
  
array("i", [3, nov, nof, noc]).tofile(out) # x, y, z, nx, ny, nz, rgba --> rgba is 4xuint8
out.write(struct.pack('{0}s'.format(noc), txt)+struct.pack('{0}x'.format(noc%4 != 0 and 4-noc%4 or 0))) # make sure that padding to 32bits is added...

print nov, nof


fp = open(infl, "rb")
fp.seek(offset)  
out.write(fp.read(28*nov))    
fp.seek(offset+(nov*28))
tmp = ""
for i in xrange(nof):
  fp.seek(1, 1)
  chunk = fp.read(12)
  data = struct.unpack("iii", chunk)
  tmp += struct.pack("iii", data[0], data[1], data[2])
fp.close()
out.write(tmp)
out.close()

