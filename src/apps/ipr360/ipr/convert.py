import yaml, sys, json

infl = sys.argv[1]
if not infl.endswith(".yml"):
  print("Not a yaml file")
  exit()

outfl = infl.replace(".yml", ".json")
open(outfl, "w").write(json.dumps(yaml.load(open(infl).read())))