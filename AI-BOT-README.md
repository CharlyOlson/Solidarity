# Solidarity AI Bot

This component integrates the Solidarity platform's harmonic mathematics system with modern AI capabilities through the Perplexity API. The bot intelligently selects models and formats requests based on input features derived from golden ratio mathematics.

## Features

- **Adaptive Model Selection**: Automatically selects appropriate models based on input characteristics
- **Harmonic Request Formatting**: Applies golden ratio principles to structure prompts
- **Response Caching**: Improves performance by caching API responses and computed features
- **Interactive CLI**: Command-line interface for direct interaction
- **Dry Run Testing**: Test mode that shows computed features without making API calls

## Setup

1. Copy the `.env.template` file to `.env`:
   ```
   cp .env.template .env
   ```

2. Add your Perplexity API key to the `.env` file:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

3. Install required Node.js dependencies:
   ```
   npm install axios dotenv
   ```

## Usage

### Running the Bot

#### Windows:
```
run-aibot.bat --interactive
```

#### Unix/Linux/macOS:
```
chmod +x run-aibot.sh
./run-aibot.sh --interactive
```

### Available Options

- `--interactive`: Run in interactive mode (chat-like interface)
- `--dry-run`: Run automated tests without making API calls
- `--dry-interactive`: Interactive mode without API calls
- `--direct`: Run the SolidarityAIBot.js file directly

### Testing

The `test-aibot.js` script provides comprehensive testing of the AI Bot functionality:

```
node test-aibot.js
```

This will run through a series of test prompts to verify the bot's operation. Use the following flags:

- `--dry-run`: Test without making actual API calls, showing only the computed features and mode selection
- `--interactive`: Run in interactive mode where you can input your own test prompts

## How It Works

1. **Input Analysis**: Each prompt is analyzed using golden ratio mathematics to extract features
2. **Adaptive Selection**: Based on complexity metrics, an appropriate model is selected
3. **Harmonic Processing**: Complex inputs trigger harmonic mode, which applies mathematical transformations to the prompt
4. **Caching**: Frequently requested prompts bypass API calls using local cache
5. **Response Formatting**: Responses are unified and presented consistently

## Key Components

- `SolidarityAIBot.js`: Main bot implementation
- `test-aibot.js`: Test suite for verification
- `perplexityIntegration.js`: Handles API communication
- `HarmonicAIInputFormatter.js`: Computes mathematical features and structures prompts
- `HarmonicCache.js`: Stores computed features and API responses

## Integration with Solidarity Platform

The AI Bot integrates with the broader Solidarity platform through:

1. Golden harmonic mathematics from `goldenHarmonicSystem.js`
2. ZIP phrase parsing via `EnhancedHarmonicPhraseParser.js`
3. Shared caching infrastructure

## Configuration Options

Edit the `.env` file to configure:

- `DEFAULT_MODEL`: Default model to use when features don't suggest another
- `DEFAULT_TEMPERATURE`: Base temperature for API requests
- `DEBUG_LEVEL`: Detail level of debug output (0-3)
- `ENABLE_CACHE`: Toggle caching functionality
- `CACHE_DIRECTORY`: Location for cache files
- `MAX_CACHE_AGE_DAYS`: Cache expiration period