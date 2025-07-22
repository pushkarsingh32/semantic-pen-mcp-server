# Semantic Pen MCP Server

The official MCP server for **Semantic Pen** - an advanced **AI article generator** and **SEO content writer**. Create, manage, and optimize SEO-friendly articles directly from Claude Code and Cursor with powerful AI automation.

## Quick Setup (Recommended)

Just add this to your MCP configuration - no installation required!

### One-Click Install for Cursor

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-blue?style=for-the-badge&logo=cursor)](https://cursor.com/install-mcp?name=semantic-pen&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsInNlbWFudGljLXBlbi1tY3Atc2VydmVyQGxhdGVzdCJdLCJlbnYiOnsiU0VNQU5USUNfUEVOX0FQSV9LRVkiOiJ5b3VyLWFwaS1rZXktaGVyZSJ9fQ%3D%3D)

**⚠️ Important**: After clicking the button above, you'll need to replace `your-api-key-here` with your actual Semantic Pen API key in the Cursor settings.

<details>
<summary>What does this button do?</summary>

The button automatically adds this configuration to your Cursor MCP settings:

```json
{
  "command": "npx",
  "args": ["-y", "semantic-pen-mcp-server@latest"],
  "env": {
    "SEMANTIC_PEN_API_KEY": "your-api-key-here"
  }
}
```

You just need to replace the API key placeholder with your actual key.
</details>

### For Claude Code

Add to your `~/.config/claude-code/settings.json`:

```json
{
  "mcpServers": {
    "semantic-pen": {
      "command": "npx",
      "args": ["-y", "semantic-pen-mcp-server@latest"],
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
      "args": ["-y", "semantic-pen-mcp-server@latest"],
      "env": {
        "SEMANTIC_PEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `your-api-key-here` with your actual Semantic Pen API key.

### For Windsurf

Add to your `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "semantic-pen": {
      "command": "npx",
      "args": ["-y", "semantic-pen-mcp-server@latest"],
      "env": {
        "SEMANTIC_PEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then restart Windsurf to load the new MCP server. Access through Cascade → Configure (hammer icon).

## Features

- 🤖 **AI-Powered Article Creation** - Generate SEO-optimized articles with advanced AI automation
- 📊 **SEO Content Optimization** - Built-in keyword targeting and SEO best practices
- 📋 **Content Project Management** - Organize and manage your AI writing projects efficiently
- 🔍 **Smart Content Search** - Find and filter articles across projects instantly
- ⚡ **Automated Workflow** - Streamline your content creation process with AI automation
- 📄 **Full Content Access** - Retrieve complete article HTML ready for publishing
- 🔑 **Seamless Authentication** - Automatic API verification for hassle-free setup

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
Generate SEO-optimized AI articles with advanced customization
```
targetArticleTopic (string): The article topic/title for AI content generation
targetKeyword (string, optional): Primary SEO keyword for optimization
wordCount (number, optional): Target word count for content length (default: 1000)
language (string, optional): Content language (default: English)
articleType (string, optional): Article format type (default: Article)
toneOfVoice (string, optional): Writing tone and style (default: Professional)
```

### `get_article`
Get a specific article by ID with full content
```
articleId (string): The ID of the article to retrieve
```

## Example Usage

1. **Browse Content Projects**: Use `get_projects` to view your AI article generation projects
2. **Explore Project Content**: Use `get_project_articles` to see all AI-generated articles in a specific project
3. **Generate AI Articles**: Use `create_article` with topics like "AI Content Marketing Strategies for 2024"
4. **Access Generated Content**: Use `get_article` to retrieve your SEO-optimized article content ready for publishing

## Getting Your API Key

1. Visit [SemanticPen.com](https://www.semanticpen.com) - Your AI article writing platform
2. Create your account or log in to access the AI content generator
3. Navigate to API settings to generate your content automation key
4. Copy the API key and configure it for seamless AI article generation

## Manual Installation (Alternative)

If you prefer to install manually:

```bash
npm install -g semantic-pen-mcp-server
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
- Visit [SemanticPen.com](https://www.semanticpen.com) for support
- Check your API key is valid and has sufficient credits
- Ensure stable internet connection for API calls