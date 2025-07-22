# Semantic Pen MCP Server

A one-click MCP server for Semantic Pen that allows you to create, view, and manage articles and projects directly from Claude Code and Cursor.

## Quick Setup (Recommended)

Just add this to your MCP configuration - no installation required!

### For Claude Code

Add to your `~/.config/claude-code/settings.json`:

```json
{
  "mcpServers": {
    "semantic-pen": {
      "command": "npx",
      "args": ["-y", "@semanticpen/mcp-server@latest"],
      "env": {
        "SEMANTIC_PEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### For Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "semantic-pen": {
      "command": "npx",
      "args": ["-y", "@semanticpen/mcp-server@latest"],
      "env": {
        "SEMANTIC_PEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `your-api-key-here` with your actual Semantic Pen API key.

## Features

- 🔑 **Automatic API Key Verification** - Verifies your API key on startup
- 📋 **Project Management** - View all your projects from article queue  
- 📚 **Article Management** - View articles within specific projects
- 🔍 **Project Search** - Search projects by name
- ✍️ **Article Creation** - Create new articles with customizable settings
- 📄 **Article Retrieval** - Get specific article content and metadata with full HTML

## Available Tools

### `get_projects`
Get all your projects from the article queue
```
No parameters required
```

### `get_project_articles`
Get all articles from a specific project
```
projectId (string): The project ID to get articles from
```

### `search_projects`  
Search projects by name
```
projectName (string): The project name to search for (partial match)
```

### `create_article`
Create a new article
```
targetArticleTopic (string): The topic/title for the article
targetKeyword (string, optional): Target SEO keyword
wordCount (number, optional): Target word count (default: 1000)
language (string, optional): Language (default: English)
articleType (string, optional): Type of article (default: Article)
toneOfVoice (string, optional): Tone of voice (default: Professional)
```

### `get_article`
Get a specific article by ID with full content
```
articleId (string): The ID of the article to retrieve
```

## Example Usage

1. **View Projects**: Use `get_projects` to see all your projects
2. **View Project Articles**: Use `get_project_articles` with a project ID to see articles in that project
3. **Create Article**: Use `create_article` with a topic like "How to Use AI for Content Creation"
4. **Get Article Content**: Use `get_article` with the returned article ID to see the generated content

## Getting Your API Key

1. Visit [SemanticPen.com](https://semanticpen.com)
2. Sign up or log in to your account
3. Go to your API settings to generate an API key
4. Copy the key and use it in your MCP configuration

## Manual Installation (Alternative)

If you prefer to install manually:

```bash
npm install -g @semanticpen/mcp-server
```

Then use in your MCP config:
```json
{
  "command": "semantic-pen-mcp",
  "env": {
    "SEMANTIC_PEN_API_KEY": "your-api-key-here"
  }
}
```

## Troubleshooting

- **"API key not configured"**: Make sure `SEMANTIC_PEN_API_KEY` is set in the env section
- **"API key verification failed"**: Check that your API key is valid and active
- **Server not starting**: Ensure you have Node.js 18+ installed

## Support

For issues or questions:
- Visit [SemanticPen.com](https://semanticpen.com) for support
- Check your API key is valid and has sufficient credits
- Ensure stable internet connection for API calls