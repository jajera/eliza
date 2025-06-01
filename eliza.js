class Eliza {
    constructor() {
        this.tracingEnabled = false;
        this.memoryQueue = [];
        this.wordSubstitutions = {
            "i'm": "i am",
            "i'd": "i would",
            "i've": "i have",
            "i'll": "i will",
            "you're": "you are",
            "you've": "you have",
            "you'll": "you will",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "they're": "they are",
            "don't": "do not",
            "doesn't": "does not",
            "didn't": "did not",
            "won't": "will not",
            "wouldn't": "would not",
            "couldn't": "could not",
            "shouldn't": "should not",
            "can't": "cannot"
        };
        this.colorSchemes = {
            'default': {'--primary-color': '#0f0', '--accent-color': '#0ff'},
            'blue': {'--primary-color': '#00f', '--accent-color': '#0ff'},
            'red': {'--primary-color': '#f00', '--accent-color': '#f0f'},
            'yellow': {'--primary-color': '#ff0', '--accent-color': '#f80'},
            'cyan': {'--primary-color': '#0ff', '--accent-color': '#0a0'}
        };
        this.initialResponses = [
            "Hello! I am ELIZA. How are you feeling today?",
            "Hi there! I'm ELIZA. What's on your mind?",
            "Greetings! I am ELIZA. How can I help you today?"
        ];

        this.quitResponses = [
            "Goodbye. It was nice talking to you.",
            "Farewell. I hope our conversation was helpful.",
            "Until next time. Take care."
        ];

        this.patterns = [
            {
                pattern: /\*help/i,
                responses: [
                    [
                        "Available commands:",
                        "",
                        "*help       - Show this help message",
                        "*traceauto  - Toggle tracing mode",
                        "*clear    - Clear the chat history",
                        "*reset    - Reset the conversation",
                        "*color <scheme> - Change the color scheme (e.g., *color blue)",
                        "",
                        "You can talk to me about your feelings, and I'll try to respond in a way that helps you explore them."
                    ].join("\n")
                ]
            },
            {
                pattern: /\*clear/i,
                responses: ["Clearing chat history..."]
            },
             {
                pattern: /\*reset/i,
                responses: ["Resetting conversation..."]
            },
             {
                pattern: /\*color\s+(\w+)/i,
                responses: ["Changing color to $1..."]
            },
            {
                pattern: /.*\bI am\b.*(?:sad|unhappy|depressed|miserable).*/i,
                responses: [
                    "I'm sorry to hear that you're feeling this way. Can you tell me more about what's making you feel this way?",
                    "How long have you been feeling like this?",
                    "That must be difficult for you. Would you like to talk about it?"
                ]
            },
            {
                pattern: /.*\bI am\b.*(?:happy|glad|joyful|excited).*/i,
                responses: [
                    "I'm glad to hear that you're feeling good. What's making you feel this way?",
                    "That's wonderful! Can you tell me more about what's bringing you joy?",
                    "It's great that you're feeling positive. What else is going well in your life?"
                ]
            },
            {
                pattern: /.*\bI am\b.*/i,
                responses: [
                    "How long have you been that way?",
                    "How do you feel about being that way?",
                    "What makes you think you are that way?"
                ]
            },
            {
                pattern: /.*\bI feel\b.*/i,
                responses: [
                    "Tell me more about these feelings.",
                    "Do you often feel this way?",
                    "What do you think is causing these feelings?"
                ]
            },
            {
                pattern: /.*\bI want\b.*/i,
                responses: [
                    "Why do you want that?",
                    "What would it mean if you got that?",
                    "How would getting that help you?"
                ]
            },
            {
                pattern: /.*\bI need\b.*/i,
                responses: [
                    "Why do you need that?",
                    "What would happen if you didn't get what you need?",
                    "How long have you needed this?"
                ]
            },
            {
                pattern: /.*\bI can't\b.*/i,
                responses: [
                    "Why do you think you can't?",
                    "What's stopping you?",
                    "Have you tried?"
                ]
            },
            {
                pattern: /.*\bI don't\b.*/i,
                responses: [
                    "Why don't you?",
                    "What's preventing you from doing that?",
                    "Have you tried?"
                ]
            },
            {
                pattern: /.*\bI'm\b.*/i,
                responses: [
                    "How long have you been that way?",
                    "How do you feel about being that way?",
                    "What makes you think you are that way?"
                ]
            },
            {
                pattern: /.*\bmy\b.*/i,
                responses: [
                    "Tell me more about that.",
                    "How does that make you feel?",
                    "Why is that important to you?"
                ]
            },
            {
                pattern: /.*\b(?:yes|yeah|yep)\b.*/i,
                responses: [
                    "I see. Please continue.",
                    "Tell me more about that.",
                    "How does that make you feel?"
                ]
            },
            {
                pattern: /.*\b(?:no|nope|nah)\b.*/i,
                responses: [
                    "Why not?",
                    "Are you sure?",
                    "What makes you say no?"
                ]
            }
        ];

        this.fallbackResponses = [
            "Please tell me more.",
            "I see. Go on.",
            "That's interesting. Can you elaborate?",
            "How does that make you feel?",
            "Why do you say that?"
        ];
    }

    processInput(input) {
        let processedInput = input.toLowerCase();
        let substitutions = [];

        // Apply word substitutions
        for (const [original, replacement] of Object.entries(this.wordSubstitutions)) {
            if (processedInput.includes(original)) {
                processedInput = processedInput.replace(original, replacement);
                substitutions.push(`${original} -> ${replacement}`);
            }
        }

        return {
            processedInput,
            substitutions: substitutions.length > 0 ? substitutions : ['<none>']
        };
    }

    findKeywords(input) {
        const keywords = [];
        for (const { pattern } of this.patterns) {
            if (pattern.test(input)) {
                const patternStr = pattern.toString();
                // Exclude the command patterns from keyword list for clarity in trace
                if (!patternStr.includes('*clear') && !patternStr.includes('*reset') && !patternStr.includes('*color') && !patternStr.includes('*traceauto') && !patternStr.includes('*help')){
                     keywords.push(patternStr.slice(1, -2)); // Remove / and /i from regex
                }
            }
        }
        return keywords;
    }

    getResponse(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('bye') || lowerInput.includes('goodbye')) {
            const response = this.getRandomResponse(this.quitResponses);
            return this.tracingEnabled ? response.toUpperCase() : response;
        }

        if (lowerInput === '*traceauto') {
            this.tracingEnabled = !this.tracingEnabled;
            return `tracing ${this.tracingEnabled ? 'enabled' : 'disabled'}`;
        }

        // Command handling moved to event listener

        let traceOutput = '';
        if (this.tracingEnabled) {
            traceOutput = `\n | input: ${input.toUpperCase()}\n`;
            traceOutput += ' | LIMIT: 1 (PLEASE CONTINUE)\n';

            const { processedInput, substitutions } = this.processInput(input);
            traceOutput += ` | word substitutions made: ${substitutions.join(', ')}\n`;

            const keywords = this.findKeywords(processedInput);
            traceOutput += ` | ${keywords.length > 0 ? 'keywords found: ' + keywords.join(', ') : 'no keywords found in subclause: ' + processedInput.toUpperCase()}\n`;

            traceOutput += ` | memory queue: ${this.memoryQueue.length > 0 ? this.memoryQueue.join(', ') : '<empty>'}\n`;
        }

        let response = null;
        // Check general patterns after checking commands
        for (const { pattern, responses } of this.patterns) {
             // Skip command patterns here as they are handled in the event listener
            if (pattern.toString().includes('*clear') || pattern.toString().includes('*reset') || pattern.toString().includes('*color') || pattern.toString().includes('*traceauto') || pattern.toString().includes('*help')) {
                 continue;
            }
            if (pattern.test(input)) {
                response = this.getRandomResponse(responses);
                break;
            }
        }

        if (!response) {
            response = this.getRandomResponse(this.fallbackResponses);
            if (this.tracingEnabled) {
                traceOutput += ' | response is the next remark from the NONE rule\n';
            }
        }

        if (this.tracingEnabled) {
            traceOutput += response.toUpperCase();
            return traceOutput;
        }

        return response;
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// UI Interaction
document.addEventListener('DOMContentLoaded', () => {
    const eliza = new Eliza();
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const body = document.body;

    // Create a wrapper div for the chat box
    const chatBox = document.createElement('div');
    chatBox.className = 'chat-box';

    // Move existing elements into the new wrapper
    chatBox.appendChild(chatContainer);
    chatBox.appendChild(userInput);

    // Clear the current body content and add the new chat box
    body.innerHTML = '';
    body.appendChild(chatBox);

    // Add responsive styles and CSS variables
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --primary-color: #0f0;
            --accent-color: #0ff;
        }

        body {
            margin: 0;
            padding: 0; /* Remove padding from body */
            background-color: #222;
            color: var(--primary-color); /* Use CSS variable */
            font-family: monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden; /* Prevent body scroll */
        }
        .chat-box {
            width: 100%;
            max-width: 800px; /* Max width on large screens */
            height: 100vh; /* Use full viewport height */
            max-height: 900px; /* Max height */
            border: 1px solid var(--primary-color); /* Use CSS variable */
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box; /* Include border in element's total width and height */
        }
        #chat-container {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            word-break: break-word; /* Prevent long words from overflowing */
        }
        .message {
            margin-bottom: 10px;
        }
        .user {
            color: var(--accent-color); /* Use CSS variable */
        }
        .eliza {
            color: var(--primary-color); /* Use CSS variable */
        }
        #user-input {
            width: 100%;
            padding: 10px;
            border: none;
            border-top: 1px solid var(--primary-color); /* Use CSS variable */
            background-color: #333;
            color: var(--primary-color); /* Use CSS variable */
            outline: none;
            box-sizing: border-box; /* Include padding and border in width */
            font-family: monospace;
            flex-shrink: 0; /* Prevent input from shrinking */
        }

        /* Basic responsiveness for smaller screens */
        @media (max-width: 600px) {
            .chat-box {
                border: none; /* Remove border on small screens */
                height: 100vh; /* Full height on mobile */
                max-height: unset; /* Remove max height constraint */
            }
             body {
                align-items: flex-start; /* Align to top on small screens */
            }
        }
    `;
    document.head.appendChild(style);

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'eliza'}`;

        let processedText = text;

        // Regex to find URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        // Replace URLs with clickable links (applies to all messages now)
        processedText = processedText.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

        if (!isUser && (processedText.includes('|') || processedText.includes('*help'))) {
            // For tracing output and help command, preserve the formatting
            messageDiv.style.whiteSpace = 'pre-wrap'; // Use pre-wrap to allow wrapping long lines
            messageDiv.style.fontFamily = 'monospace';
            messageDiv.innerHTML = isUser ? `${processedText}` : `ELIZA: ${processedText}`;
        } else {
            messageDiv.innerHTML = isUser ? `${processedText}` : `ELIZA: ${processedText}`;
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Initial greeting and intro messages
    setTimeout(() => {
        addMessage("ELIZA v1.0", true);
        addMessage("", true);
        addMessage("This is my implementation of the original ELIZA program, created in 1966 by Joseph Weizenbaum.", true);
        addMessage("It simulates therapist-style conversations using pattern matching — now rebuilt in modern JavaScript.", true);
        addMessage("If you'd like to learn more or explore the code, visit: https://github.com/jajera/eliza", true);
        addMessage("-", true);
        addMessage("Type *help to see the list of available commands.", true);
        addMessage("-", true);
        addMessage(eliza.getRandomResponse(eliza.initialResponses));
    }, 500);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && userInput.value.trim()) {
            const userMessage = userInput.value.trim();
            addMessage(userMessage, true);
            userInput.value = '';

            // Handle commands
            const lowerUserMessage = userMessage.toLowerCase();

            if (lowerUserMessage === '*clear') {
                // Clear chat history
                chatContainer.innerHTML = '';
                addMessage("Chat history cleared.", false);
                 return; // Stop further processing
            }

            if (lowerUserMessage === '*reset') {
                // Reset conversation
                addMessage("Resetting conversation...", false);
                setTimeout(() => {
                     window.location.reload();
                }, 1000); // Give time for the message to show
                 return; // Stop further processing
            }

             const colorMatch = lowerUserMessage.match(/^\*color\s+(\w+)$/);
            if (colorMatch) {
                const schemeName = colorMatch[1];
                if (eliza.colorSchemes[schemeName]) {
                    const root = document.documentElement;
                    for (const [variable, color] of Object.entries(eliza.colorSchemes[schemeName])) {
                        root.style.setProperty(variable, color);
                    }
                    addMessage(`Color scheme set to ${schemeName}.`, false);
                } else {
                    addMessage(`Color scheme "${schemeName}" not found. Available schemes: ${Object.keys(eliza.colorSchemes).join(', ')}.`, false);
                }
                 return; // Stop further processing
            }

             if (lowerUserMessage === '*traceauto') {
                eliza.tracingEnabled = !eliza.tracingEnabled;
                addMessage(`tracing ${eliza.tracingEnabled ? 'enabled' : 'disabled'}`, false);
                return; // Stop further processing
            }

             if (lowerUserMessage === '*help') {
                 // Find the help pattern and use its response
                const helpPattern = eliza.patterns.find(p => p.pattern.test(lowerUserMessage));
                if (helpPattern) {
                    const response = eliza.getRandomResponse(helpPattern.responses);
                    addMessage(response, false);
                }
                 return; // Stop further processing
            }

            // Simulate typing delay and get Eliza's response for non-command inputs
            setTimeout(() => {
                const response = eliza.getResponse(userMessage);
                addMessage(response);
            }, 500 + Math.random() * 1000);
        }
    });
});
