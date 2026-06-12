import time
import sys
import os

def reveal_tea():
    # TikTok branding colors (ANSI escape codes)
    CYAN = '\033[96m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

    # Start with a clean slate for recording
    os.system('cls' if os.name == 'nt' else 'clear')

    print(f"\n{BOLD}{CYAN}=== WORLD CUP TEA ☕ ==={END}")
    print(f"{BOLD}Question:{END} Why are Ugandans {RED}NOT{END} supporting South Africa? 🤔")
    
    print(f"\n{BOLD}Ready?{END}")
    input("Tap ENTER to reveal the truth 🤫")

    # Dramatic Countdown
    print("\n")
    for frame in ["3...", "2...", "1...", "🔥"]:
        sys.stdout.write(f"\r{BOLD}{CYAN}{frame}{END}   ")
        sys.stdout.flush()
        time.sleep(0.7)
    
    # System alert sound (Works on Windows/macOS/Linux)
    sys.stdout.write('\a')
    
    # Final TikTok Caption Style Reveal
    print(f"\n\n{BOLD}{CYAN}POV: When Pan-Africanism leaves the chat 💀{END}")
    print("-" * 45)
    print(f"✈️  {BOLD}Send Backs?{END} No cheers for you. 🚫")
    print(f"🇳🇬  {BOLD}The Switch:{END} We're with Nigeria & Senegal now! ⚡")
    print(f"📉  {BOLD}Respect:{END} It's a two-way street. 🤝")
    print("-" * 45)
    print(f"{BOLD}{RED}STRICTLY VIBES & RECIPROCITY! 🔥💯{END}\n")

if __name__ == "__main__":
    try:
        reveal_tea()
    except KeyboardInterrupt:
        sys.exit()