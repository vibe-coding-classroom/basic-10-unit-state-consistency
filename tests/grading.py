import os
import re

def check_cpp():
    print("--- Checking main.cpp ---")
    path = "src/main.cpp"
    if not os.path.exists(path):
        print(f"FAIL: {path} not found")
        return False
    
    with open(path, 'r') as f:
        content = f.read()
    
    checks = {
        "Sequence Variable": r"uint32_t\s+\w*seq\w*\s*=\s*\d+;",
        "Sequence in JSON": r"\[[\"']seq[\"']\]\s*=\s*\w*seq\w*\+\+;",
        "ACK logic": r"\[[\"']ack_id[\"']\]\s*="
    }
    
    passed = True
    for name, pattern in checks.items():
        if re.search(pattern, content):
            print(f"PASS: {name} found")
        else:
            print(f"FAIL: {name} NOT found")
            passed = False
    return passed

def check_js():
    print("\n--- Checking App_Logic.js ---")
    path = "src/App_Logic.js"
    if not os.path.exists(path):
        print(f"FAIL: {path} not found")
        return False
    
    with open(path, 'r') as f:
        content = f.read()
    
    checks = {
        "Sequence Filtering": r"if\s*\(.*seq\s*>\s*lastReceivedSeq.*\)",
        "Retry Loop": r"for\s*\(.*retryCount.*\)",
        "Promise ACK": r"new\s+Promise",
        "SSoT Update": r"robotState\s*=\s*\{\s*\.\.\.robotState"
    }
    
    passed = True
    for name, pattern in checks.items():
        if re.search(pattern, content):
            print(f"PASS: {name} found")
        else:
            print(f"FAIL: {name} NOT found")
            passed = False
    return passed

if __name__ == "__main__":
    cpp_ok = check_cpp()
    js_ok = check_js()
    
    if cpp_ok and js_ok:
        print("\nOVERALL STATUS: SUCCESS")
        exit(0)
    else:
        print("\nOVERALL STATUS: FAILURE")
        exit(1)
