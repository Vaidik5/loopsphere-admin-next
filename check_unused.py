import os

# Define source directories to look for components
COMPONENT_DIRS = [
    'components',
    'app/components'
]

# Define directories to search for usage
SEARCH_DIRS = [
    'app',
    'components',
    'lib',
    'hooks',
    'providers',
    'config', 
    'services',
    'models'
]

def get_component_files():
    components = []
    for d in COMPONENT_DIRS:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    if file in ['page.tsx', 'layout.tsx', 'not-found.tsx', 'loading.tsx', 'error.tsx', 'global-error.tsx', 'route.ts']:
                        continue # Skip Next.js app router special files
                    
                    full_path = os.path.join(root, file)
                    components.append(full_path)
    return components

def is_used(component_path, component_files):
    # Component name logic
    filename = os.path.basename(component_path)
    name_no_ext = os.path.splitext(filename)[0]
    
    # If it's index.ts, we usually don't treat it as a component to check for usage directly, 
    # but rather check what it exports. However, for "unused file" detection, check if 'index' is imported? 
    # Usually index files are imported by their directory name. 
    # Let's skip checking usage of 'index.ts' files themselves for now, or handle them specially.
    # Actually, if we want to clean up, we want to know if specific UI components are unused.
    if name_no_ext == 'index':
        # If the directory containing index.ts is imported, then index.ts is used.
        # Check if directory name is present in imports.
        dir_name = os.path.basename(os.path.dirname(component_path))
        token_to_search = dir_name
    else:
        token_to_search = name_no_ext

    usage_count = 0
    
    for d in SEARCH_DIRS:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for file in files:
                if not (file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.js') or file.endswith('.jsx')):
                    continue
                
                file_path = os.path.join(root, file)
                
                # Don't check self usage
                if os.path.abspath(file_path) == os.path.abspath(component_path):
                    continue
                
                # If checking a component X, and we are in index.ts of the same folder, 
                # and index.ts exports X, that counts as 1 usage.
                # But if index.ts is NOT used, then X is effectively unused (if only usage is index.ts).
                
                # Let's simple text search first.
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Check for import style usage
                        # import ... from '.../token_to_search'
                        # or '.../token_to_search"'
                        
                        if f"/{token_to_search}'" in content or \
                           f"/{token_to_search}\"" in content or \
                           f"/{token_to_search}`" in content:
                           usage_count += 1
                           return True # Found at least one usage
                           
                        # Check for component usage if it's not a path import (e.g. named export import)
                        # This is harder without AST.
                        # But generally imports include the filename in the path.
                        
                        # Special case: styles usage? No.
                        
                except Exception as e:
                    pass
                    
    return False

def main():
    components = get_component_files()
    unused = []
    
    print(f"Checking {len(components)} components...")
    
    for comp in components:
        if not is_used(comp, components):
            unused.append(comp)
            
    print("\nPotentially Unused Components:")
    for u in unused:
        # relative path
        try:
            rel = os.path.relpath(u, os.getcwd())
            print(rel)
        except:
            print(u)

if __name__ == '__main__':
    main()
