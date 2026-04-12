import os

directories = ['.']
ignores = ['.git', 'node_modules', '.next', 'venv']

for root, dirs, files in os.walk(directories[0]):
    dirs[:] = [d for d in dirs if d not in ignores]
    for file in files:
        if file.endswith(('.ts', '.tsx', '.md', '.json', 'README.md', 'README')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'noxpay.vercel.app' in content:
                    content = content.replace('https://noxpay.vercel.app', 'https://nox-pay.vercel.app')
                    content = content.replace('noxpay.vercel.app', 'nox-pay.vercel.app')
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {path}")
            except Exception as e:
                pass
