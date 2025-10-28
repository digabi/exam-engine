import sys
print("Aloitetaan!")
name = None
while name != "Matti":
    name = input("Enter your name")
    print(f"Moi {name}")
    if name != "Matti":
        print(f"Not Matti, got {name}", file=sys.stderr)
print("done")