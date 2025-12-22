# Track My Spend MCP Server

A Model Context Protocol (MCP) server for tracking personal expenses and managing financial records using SQLite database.

## Features

- **Add Expenses**: Record expenses with amount, category, description, and date
- **List Expenses**: View and filter expenses by category, and date range
- **SQLite Storage**: All expenses are stored in a local SQLite database
- **Type-Safe**: Built with TypeScript and Zod for robust validation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Claude Desktop App

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Deepak-Dhungel/track-my-spend-mcp.git
cd track-my-spend-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "TrackMySpend": {
      "command": "node",
      "args": ["/absolute/path/to/track-my-spend-mcp/build/server.js"],
    }
  }
}
```

Replace `/absolute/path/to/track-my-spend-mcp` with the actual path to your project directory.

## Usage

After configuration, restart Claude Desktop. You can then interact with the expense tracker through natural language:

### Adding Expenses

```
"Add an expense of $50 for groceries"
"Track a $25 expense for lunch with description 'Team lunch at cafe'"
"Add $100 expense for travel on 2024-12-20"
```

### Listing Expenses

```
"List my expenses"
"Show me all food expenses"
"List expenses from last week"
"Show the last 5 expenses"
```

## Available Tools

### add_expense

Add a new expense to the tracker.

**Parameters:**
- `amount` (number, required): Amount spent (must be >= 0)
- `category` (string, required): Category of expense (e.g., food, transport, entertainment)
- `description` (string, optional): Additional details about the expense
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)

### list_expenses

List and filter expenses.

**Parameters:**
- `category` (string, optional): Filter by specific category
- `startDate` (string, optional): Show expenses from this date onwards (YYYY-MM-DD)
- `endDate` (string, optional): Show expenses up to this date (YYYY-MM-DD)


## Project Structure

```
track-my-spend-mcp/
├── src/
│   ├── db.ts              # SQLite database configuration
│   ├── server.ts          # MCP server setup and tool registration
│   └── tools/
│       ├── index.ts       # Tool exports
│       ├── addExpense.ts  # Add expense tool implementation
│       └── listExpenses.ts # List expenses tool implementation
├── build/                 # Compiled JavaScript files
├── expenses.db             # SQLite database (created automatically)
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Building

```bash
npm run build
```

### Testing Locally

Run the server directly to test:

```bash
node build/server.js
```

The server communicates via stdio, so you won't see output unless there are errors (which go to stderr).

### Debugging

Check Claude Desktop logs:

**macOS**: `~/Library/Logs/Claude/mcp-server-TrackMySpend.log`

**Windows**: `%APPDATA%\Claude\logs\mcp-server-TrackMySpend.log`

## Database Schema

The expenses table structure:

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL
);
```

## Technologies Used

- **TypeScript**: Type-safe development
- **Model Context Protocol (MCP)**: Claude integration
- **better-sqlite3**: SQLite database operations
- **Zod**: Schema validation
- **Node.js**: Runtime environment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Troubleshooting

### Server shows as "Failed" in Claude Desktop

1. Check that the path in `claude_desktop_config.json` is correct and absolute
2. Ensure you've run `npm run build` after making changes
3. Check the logs for specific error messages
4. Restart Claude Desktop completely (quit and reopen)

### "Could not attach to MCP server"

- Verify Node.js is installed and accessible at the path specified
- Check file permissions on the build directory
- Ensure no `console.log` statements exist (use `console.error` instead)


## Support

For issues and questions, please open an issue on the GitHub repository.
