import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import execute_query
from routes.dashboard import get_extended_stats

try:
    print("Testing get_extended_stats()...")
    res = get_extended_stats()
    print("SUCCESS!")
    print("Keys in response:", list(res.keys()))
    for key, val in res.items():
        print(f"  {key}: length {len(val)}")
        if len(val) > 0:
            print("  First item:", val[0])
except Exception as e:
    import traceback
    print("FAILED!")
    traceback.print_exc()
