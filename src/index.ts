#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://www.semanticpen.com/api';

// Type definitions based on actual API responses
interface ApiKeyVerificationResponse {
  success: boolean;
  userId: string;
  organizationId: string;
  message: string;
}

interface Project {
  id: string;
  created_at: string;
  status: string;
  statusDetails: string;
  progress: number;
  error: string | null;
  project_id: string;
  project_name: string;
  extra_data: {
    targetArticleTopic: string;
  };
  article_count: number;
}

interface ProjectArticle {
  id: string;
  title: string;
  created_at: string;
  html: string;
  setting: {
    targetKeyword?: string;
    language?: string;
    articleType?: string;
    toneOfVoice?: string;
    wordCount?: string;
    [key: string]: any;
  };
  article_tag?: string;
}

interface ArticleDetail {
  id: string;
  created_at: string;
  user_id: string;
  config: {
    targetKeyword?: string;
    language?: string;
    articleType?: string;
    toneOfVoice?: string;
    wordCount?: string;
    [key: string]: any;
  };
  status: string;
  statusDetails: string;
  progress: number;
  error: string | null;
  extra_data: {
    targetArticleTopic: string;
  };
  output: string;
  project_id: string;
  project_name: string;
  organization_id: string;
}

interface ProjectQueueResponse {
  data: {
    projects: Project[];
  };
  count: number;
  error: string | null;
}

interface ProjectArticlesResponse {
  data: {
    articles: ProjectArticle[];
  };
  count: number;
  projectId: string;
  error: string | null;
}

interface CreateArticleRequest {
  targetArticleTopic: string;
  targetKeyword?: string;
  wordCount?: number;
  language?: string;
  articleType?: string;
  toneOfVoice?: string;
}

interface CreateArticleResponse {
  id: string;
  status: string;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class SemanticPenServer {
  private server: Server;
  private apiKey: string | null = null;
  private isApiKeyVerified: boolean = false;

  constructor() {
    this.server = new Server(
      {
        name: "semantic-pen-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Get API key from environment variable
    this.apiKey = process.env.SEMANTIC_PEN_API_KEY || null;
    
    this.setupToolHandlers();
  }

  private async initializeApiKey(): Promise<void> {
    if (!this.apiKey) {
      console.error("⚠️  SEMANTIC_PEN_API_KEY environment variable not set");
      return;
    }

    try {
      const result = await this.makeRequest<ApiKeyVerificationResponse>('/verify-key');
      if (result.success && result.data) {
        this.isApiKeyVerified = true;
        console.error(`✅ Semantic Pen API key verified for user: ${result.data.userId}`);
      } else {
        console.error(`❌ API key verification failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Failed to verify API key: ${error}`);
    }
  }

  private async makeRequest<T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    if (!this.apiKey) {
      throw new Error("SEMANTIC_PEN_API_KEY environment variable not set. Please configure your API key.");
    }

    try {
      const response = await axios({
        baseURL: API_BASE_URL,
        url: endpoint,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'SemanticPenMCP/1.0',
          'Content-Type': 'application/json',
        },
        ...options
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.message || error.response.data.error || 'API request failed'
        };
      }
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_projects",
            description: "Get all projects from your article queue",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_project_articles",
            description: "Get all articles from a specific project by project ID",
            inputSchema: {
              type: "object",
              properties: {
                projectId: {
                  type: "string",
                  description: "The project ID to get articles from"
                }
              },
              required: ["projectId"]
            }
          },
          {
            name: "search_projects",
            description: "Search projects by name",
            inputSchema: {
              type: "object",
              properties: {
                projectName: {
                  type: "string",
                  description: "The project name to search for (partial match)"
                }
              },
              required: ["projectName"]
            }
          },
          {
            name: "create_article",
            description: "Create a new article",
            inputSchema: {
              type: "object",
              properties: {
                targetArticleTopic: {
                  type: "string",
                  description: "The topic/title for the article"
                },
                targetKeyword: {
                  type: "string",
                  description: "Target SEO keyword for the article (optional)"
                },
                wordCount: {
                  type: "integer",
                  description: "Target word count (default: 1000)",
                  default: 1000
                },
                language: {
                  type: "string",
                  description: "Language for the article (default: English)",
                  default: "English"
                },
                articleType: {
                  type: "string",
                  description: "Type of article (default: Article)",
                  default: "Article"
                },
                toneOfVoice: {
                  type: "string",
                  description: "Tone of voice (default: Professional)",
                  default: "Professional"
                }
              },
              required: ["targetArticleTopic"]
            }
          },
          {
            name: "get_article",
            description: "Get a specific article by ID with full content",
            inputSchema: {
              type: "object",
              properties: {
                articleId: {
                  type: "string",
                  description: "The ID of the article to retrieve"
                }
              },
              required: ["articleId"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_projects":
            return await this.getProjects();

          case "get_project_articles": {
            if (!args || typeof args !== 'object' || !('projectId' in args) || typeof args.projectId !== 'string') {
              throw new Error("projectId is required and must be a string");
            }
            return await this.getProjectArticles(args.projectId);
          }

          case "search_projects": {
            if (!args || typeof args !== 'object' || !('projectName' in args) || typeof args.projectName !== 'string') {
              throw new Error("projectName is required and must be a string");
            }
            return await this.searchProjects(args.projectName);
          }

          case "create_article": {
            if (!args || typeof args !== 'object' || !('targetArticleTopic' in args) || typeof args.targetArticleTopic !== 'string') {
              throw new Error("targetArticleTopic is required and must be a string");
            }
            
            const createRequest: CreateArticleRequest = {
              targetArticleTopic: args.targetArticleTopic,
              targetKeyword: 'targetKeyword' in args && typeof args.targetKeyword === 'string' ? args.targetKeyword : undefined,
              wordCount: 'wordCount' in args && typeof args.wordCount === 'number' ? args.wordCount : undefined,
              language: 'language' in args && typeof args.language === 'string' ? args.language : undefined,
              articleType: 'articleType' in args && typeof args.articleType === 'string' ? args.articleType : undefined,
              toneOfVoice: 'toneOfVoice' in args && typeof args.toneOfVoice === 'string' ? args.toneOfVoice : undefined,
            };
            
            return await this.createArticle(createRequest);
          }

          case "get_article": {
            if (!args || typeof args !== 'object' || !('articleId' in args) || typeof args.articleId !== 'string') {
              throw new Error("articleId is required and must be a string");
            }
            return await this.getArticle(args.articleId);
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }


  private async getProjects() {
    const result = await this.makeRequest<ProjectQueueResponse>('/article-queue');
    
    if (result.success && result.data) {
      const projects = result.data.data.projects;
      
      // Group by project name and get unique projects
      const uniqueProjects = projects.reduce((acc: { [key: string]: Project & { totalArticles: number } }, project) => {
        if (!acc[project.project_id]) {
          acc[project.project_id] = {
            ...project,
            totalArticles: 1
          };
        } else {
          acc[project.project_id].totalArticles += 1;
        }
        return acc;
      }, {});

      const projectList = Object.values(uniqueProjects).map(project => 
        `📁 **${project.project_name}** (${project.totalArticles} articles)\n   Project ID: ${project.project_id}\n   Latest Article: ${project.extra_data.targetArticleTopic}\n   Created: ${new Date(project.created_at).toLocaleDateString()}\n   Status: ${project.status}`
      ).join('\n\n');

      return {
        content: [
          {
            type: "text",
            text: `📋 **Your Projects** (${Object.keys(uniqueProjects).length} projects, ${result.data.count} total articles)\n\n${projectList || 'No projects found.'}`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to fetch projects: ${result.error}`
          }
        ],
        isError: true
      };
    }
  }

  private async getProjectArticles(projectId: string) {
    const result = await this.makeRequest<ProjectArticlesResponse>(`/article-queue/${projectId}`);
    
    if (result.success && result.data) {
      const articles = result.data.data.articles;

      if (articles.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No articles found in project ${projectId}`
            }
          ]
        };
      }

      const articleList = articles.map(article => {
        const wordCount = article.html ? 
          Math.round(article.html.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length) : 0;
        
        return `📄 **${article.title}**\n   ID: ${article.id}\n   Word Count: ~${wordCount} words\n   Created: ${new Date(article.created_at).toLocaleDateString()}\n   Keyword: ${article.setting?.targetKeyword || 'N/A'}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: "text",
            text: `📚 **Project Articles** (${result.data.count} articles)\n**Project ID:** ${projectId}\n\n${articleList}`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to fetch project articles: ${result.error}`
          }
        ],
        isError: true
      };
    }
  }

  private async searchProjects(projectName: string) {
    const result = await this.makeRequest<ProjectQueueResponse>('/article-queue');
    
    if (result.success && result.data) {
      const allProjects = result.data.data.projects;
      const matchingProjects = allProjects.filter(project => 
        project.project_name.toLowerCase().includes(projectName.toLowerCase())
      );

      if (matchingProjects.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No projects found matching "${projectName}"`
            }
          ]
        };
      }

      // Group by project_id to show unique projects
      const uniqueProjects = matchingProjects.reduce((acc: { [key: string]: Project & { articles: string[] } }, project) => {
        if (!acc[project.project_id]) {
          acc[project.project_id] = {
            ...project,
            articles: [project.extra_data.targetArticleTopic]
          };
        } else {
          acc[project.project_id].articles.push(project.extra_data.targetArticleTopic);
        }
        return acc;
      }, {});

      const projectList = Object.values(uniqueProjects).map(project => 
        `📁 **${project.project_name}**\n   Project ID: ${project.project_id}\n   Articles: ${project.articles.length}\n   Latest: ${project.articles[0]}\n   Created: ${new Date(project.created_at).toLocaleDateString()}`
      ).join('\n\n');

      return {
        content: [
          {
            type: "text",
            text: `🔍 **Projects matching "${projectName}"** (${Object.keys(uniqueProjects).length} found)\n\n${projectList}`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to search projects: ${result.error}`
          }
        ],
        isError: true
      };
    }
  }

  private async createArticle(args: CreateArticleRequest) {
    const request = {
      targetArticleTopic: args.targetArticleTopic,
      targetKeyword: args.targetKeyword || '',
      wordCount: args.wordCount || 1000,
      language: args.language || 'English',
      articleType: args.articleType || 'Article',
      toneOfVoice: args.toneOfVoice || 'Professional'
    };

    const result = await this.makeRequest<CreateArticleResponse>('/articles', {
      method: 'POST',
      data: request
    });
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: "text",
            text: `✅ **Article Created Successfully!**\n\n**Topic:** ${args.targetArticleTopic}\n**Article ID:** ${result.data.id}\n**Status:** ${result.data.status}\n**Settings:**\n- Keyword: ${args.targetKeyword || 'None'}\n- Word Count: ${args.wordCount || 1000}\n- Language: ${args.language || 'English'}\n- Type: ${args.articleType || 'Article'}\n- Tone: ${args.toneOfVoice || 'Professional'}\n\n🔄 Your article is being generated. Use \`get_article\` with ID \`${result.data.id}\` to check progress and retrieve the content.`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create article: ${result.error}`
          }
        ],
        isError: true
      };
    }
  }

  private async getArticle(articleId: string) {
    const result = await this.makeRequest<ArticleDetail>(`/articles/${articleId}`);
    
    if (result.success && result.data) {
      const article = result.data;
      const title = article.extra_data?.targetArticleTopic || 'Untitled Article';
      const wordCount = article.output ? 
        Math.round(article.output.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length) : 0;
      
      // Create a clean preview of the content (first 300 characters)
      const cleanContent = article.output ? 
        article.output
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\n\s*\n/g, '\n') // Remove extra newlines
          .trim() 
        : 'Content not yet generated';

      const preview = cleanContent.length > 300 ? 
        cleanContent.substring(0, 300) + '...' : 
        cleanContent;

      const statusEmoji = article.status === 'finished' ? '✅' : 
                         article.status === 'processing' ? '🔄' : 
                         article.status === 'failed' ? '❌' : '⏳';

      return {
        content: [
          {
            type: "text",
            text: `📄 **${title}**\n\n${statusEmoji} **Status:** ${article.status} (${article.progress}%)\n**Article ID:** ${article.id}\n**Project:** ${article.project_name}\n**Created:** ${new Date(article.created_at).toLocaleDateString()}\n**Word Count:** ~${wordCount} words\n\n**Settings:**\n- Target Keyword: ${article.config?.targetKeyword || 'N/A'}\n- Language: ${article.config?.language || 'English'}\n- Type: ${article.config?.articleType || 'Article'}\n- Tone: ${article.config?.toneOfVoice || 'Professional'}\n- Target Words: ${article.config?.wordCount || 'N/A'}\n\n**Content Preview:**\n${preview}\n\n---\n💡 **Full HTML Content Available:** The complete article HTML is in the \`output\` field and can be used for publishing or further editing.`
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to fetch article: ${result.error}`
          }
        ],
        isError: true
      };
    }
  }

  async run(): Promise<void> {
    // Initialize and verify API key on startup
    await this.initializeApiKey();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🚀 Semantic Pen MCP server running on stdio");
  }
}

const server = new SemanticPenServer();
server.run().catch(console.error);