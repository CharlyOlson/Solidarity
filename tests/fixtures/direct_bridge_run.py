"""
Run one bridge operation directly (no stdio protocol) and print the
JSON-ready result. Used to compare against results returned through the
JS wrapper. Reads {"operation": ..., "parameters": ...} from stdin.
"""
import asyncio
import contextlib
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src'))
import enhancedAudioProcessingBridge as bridge_module  # noqa: E402

request = json.load(sys.stdin)
with contextlib.redirect_stdout(sys.stderr):
    bridge = bridge_module.EnhancedAudioProcessingBridge()
    result = asyncio.run(bridge._route_operation(request['operation'], request['parameters']))
print(json.dumps(bridge_module.to_jsonable(result), allow_nan=False))
