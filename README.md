# basic-school

## Environment Variables

### AI Overview Feature

The AI Overview feature uses DeepSeek to generate analytics dashboards from natural language prompts. The following environment variables are required:

- `DEEPSEEK_API_KEY` (required): Your DeepSeek API key
  - Get your API key from: https://platform.deepseek.com
  - **Required** - The feature will not work without this key
  - The API will return an error if this key is missing

- `DEEPSEEK_BASE_URL` (optional): DeepSeek API base URL
  - Default: `https://api.deepseek.com`
  - Only override if using a custom endpoint

- `DEEPSEEK_MODEL` (optional): DeepSeek model to use
  - Default: `deepseek-chat`
  - Other options: `deepseek-chat`, `deepseek-coder`, etc.

### How It Works

1. Admin enters an analytics question (e.g., "Show risk distribution by grade")
2. DeepSeek generates a dashboard specification with multiple chart definitions
3. System executes the spec against mock datasets (students, alerts, interventions, etc.)
4. Multiple charts are rendered along with AI-generated insights

### Example `.env.local`

```bash
# DeepSeek API Configuration (Required for AI Overview)
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```
