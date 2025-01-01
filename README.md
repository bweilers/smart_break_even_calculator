# Smart Break-Even Calculator

An interactive web application that helps entrepreneurs calculate their break-even point using AI-powered suggestions.

## Setup Instructions

### 1. Virtual Environment
The project uses a virtual environment named `break_even_env`. To set it up:

```bash
# Navigate to the project directory
cd /path/to/smart_break_even_calculator

# Activate the virtual environment
source break_even_env/bin/activate

# Your terminal prompt should now show (break_even_env) at the beginning
```

### 2. Dependencies
Install all required dependencies:

```bash
# Make sure your virtual environment is activated
pip install -r requirements.txt
```

### 3. Environment Variables
The application requires an OpenAI API key to function:

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```
Replace `your_openai_api_key_here` with your actual OpenAI API key. You can get one from [OpenAI's website](https://platform.openai.com/api-keys).

### 4. Running the Application

```bash
# Make sure you're in the project directory with the virtual environment activated
python3 -m flask run
```

The application will start in development mode. You should see output indicating the server is running, typically at `http://127.0.0.1:5000/`.

## Testing the Application

1. Open your web browser and navigate to `http://127.0.0.1:5000/`

2. Follow the step-by-step process:
   - Step 1: Enter your product or service description
   - Step 2: Define your target market and location
   - Step 3: Set or get AI-suggested pricing
   - Step 4: Enter or get AI-suggested cost of goods
   - Step 5: Enter or get AI-suggested overhead costs

3. View your break-even analysis results, including:
   - Break-even point in units
   - Visual chart of costs vs. revenue
   - Detailed business metrics

## Troubleshooting

### Common Issues

1. **OpenAI API Error**
   - Ensure your `.env` file exists and contains a valid API key
   - Check that the API key is properly formatted
   - Verify you have sufficient API credits

2. **Flask Server Issues**
   - Ensure the virtual environment is activated
   - Check that all dependencies are installed
   - Verify no other service is using port 5000

3. **Session Data Issues**
   - Clear your browser cache
   - Restart the Flask server
   - Ensure you're completing steps in order

### Deactivating the Virtual Environment

When you're done working with the project:

```bash
deactivate
```

## Development Notes

- The application uses Flask for the web framework
- OpenAI's GPT-4 model provides AI suggestions
- Session management is used to maintain data between steps
- Chart.js is used for data visualization
