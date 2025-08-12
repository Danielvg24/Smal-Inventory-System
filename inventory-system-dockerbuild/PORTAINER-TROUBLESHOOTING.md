# 🔧 Portainer Git Integration Troubleshooting

## GitHub/GitLab Repository Deployment Issues

### Problem: "Error when selecting GitHub after choosing GitLab function"

This error typically occurs when switching between Git providers in Portainer's stack deployment.

### Quick Solution

1. **Clear the form and start fresh**:
   - Refresh the Portainer "Add Stack" page
   - Start with a clean form

2. **Use Web Editor instead** (Recommended):
   - Choose **"Web editor"** deployment method
   - Copy content from `portainer-stack.yml`
   - Paste into the editor
   - Deploy normally

### Detailed Git Repository Setup

#### For GitHub Repository:
```
Repository URL: https://github.com/yourusername/yourrepo
Reference: refs/heads/main
Compose file path: portainer-stack.yml
```

#### For GitLab Repository:
```
Repository URL: https://gitlab.com/yourusername/yourrepo
Reference: refs/heads/main
Compose file path: portainer-stack.yml
```

### Authentication Setup

#### GitHub Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate token with `repo` permissions
3. Use token as password in Portainer (username can be anything)

#### GitLab Personal Access Token:
1. Go to GitLab → User Settings → Access Tokens
2. Create token with `read_repository` scope
3. Use token in Portainer authentication

### Common Errors and Fixes

#### Error: "Repository not found"
- **Check URL format**: Remove `.git` extension if present
- **Verify permissions**: Ensure token has repository access
- **Check branch name**: Use `main` instead of `master` if applicable

#### Error: "Authentication failed"
- **Regenerate token**: Create new personal access token
- **Check scopes**: Ensure proper permissions
- **Test token**: Verify token works with git clone

#### Error: "Compose file not found"
- **Check file path**: Ensure `portainer-stack.yml` exists in repo root
- **Verify branch**: Confirm you're using the correct branch
- **Case sensitivity**: Check exact filename spelling

### Alternative: Local File Deployment

If Git integration continues to fail:

1. **Download/clone repository locally**
2. **Upload files to Portainer file system**:
   ```bash
   /portainer/Files/AppData/inventory/
   ├── backend/
   ├── frontend/
   └── portainer-stack.yml
   ```
3. **Use "Web editor" method with uploaded content**

### Testing Your Setup

1. **Verify repository access**:
   ```bash
   git clone https://github.com/yourusername/yourrepo
   ```

2. **Check stack file**:
   ```bash
   cat yourrepo/portainer-stack.yml
   ```

3. **Validate compose syntax**:
   ```bash
   docker-compose -f portainer-stack.yml config
   ```

### Best Practices

- ✅ Use **Web editor** for simplicity
- ✅ Keep stack files in repository root
- ✅ Use descriptive branch names
- ✅ Test tokens before using in Portainer
- ✅ Document your repository structure

- ❌ Don't mix GitHub/GitLab URLs in same form
- ❌ Don't use expired tokens
- ❌ Don't assume default branch names
- ❌ Don't ignore case sensitivity

### Emergency Deployment

If you need to deploy immediately:

1. **Copy stack content** from `portainer-stack.yml`
2. **Use Web editor method** in Portainer
3. **Deploy with local build context**: `/portainer/Files/AppData/inventory`
4. **Set environment variables** manually
5. **Deploy stack**

This bypasses all Git integration issues and gets your application running quickly. 