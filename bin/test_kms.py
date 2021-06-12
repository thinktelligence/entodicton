import os
import pdb
import json
import shlex
import subprocess

package_json_path = '{}/../kms/package.json'.format(os.path.dirname(os.path.abspath(__file__)))
tests = []
with open(package_json_path) as f:
  package = json.load(f)
  for fname in package['files']:
    if fname.endswith('.test'):
      parts = os.path.split(fname)
      parts = (parts[0], parts[1].split('.')[0])
      tests.append(parts)

def command(cmd):
  out = subprocess.Popen(shlex.split(cmd), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  stdout, stderr = out.communicate()
  try:
    stdout = json.loads(stdout.decode('ascii'))
  except BaseException:
    pass
  return stdout, stderr

start_dir = os.path.dirname(os.path.abspath(__file__))
for directory, name in tests:
  os.chdir('{}/../kms/{}'.format(start_dir, directory))
  cmd = 'node {}.js -t'.format(name)
  json, err = command(cmd)
  if len(json['failures']) > 0:
    exit(-1)

exit(0)
