https://supabase.com/docs/guides/getting-started/mcp?queryGroups=os&os=windows

I'm trying to add Supabase MCP to GitHub Code Pilot. When I pressed the add server button, I got these options. Which one should I press?

Edit

Pondering which Supabase MCP server option to choose

5s

I'll help you figure out the right option for adding Supabase MCP. Let me search for information about how Supabase MCP is typically distributed and installed.

Supabase MCP server install npm package
10 results

Decoded Supabase MCP installation method for GitHub Code Pilot.

2s

Based on the search results, you should choose "NPM Package" from the menu.

The official Supabase MCP server is distributed as an NPM package with the name: @supabase/mcp-server-supabase
GitHub
npm

When you select "NPM Package", you'll need to enter this package name. The server is typically run using npx -y @supabase/mcp-server-supabase@latest --access-token=<personal-access-token>
Supabase MCP Server
, so GitHub Code Pilot should handle the npx execution automatically once you provide the package name.

You'll also need to have a Supabase personal access token ready, which you can create from your Supabase account settings. The configuration will likely ask for this token as a parameter when setting up the MCP server.
