import { StudyPlan, Flashcard } from '@/types/study';

export const modernSoftwareCourse: StudyPlan = {
  id: 'cs146s',
  title: 'CS146S: The Modern Software Developer',
  institution: 'Stanford University',
  term: 'Fall 2025',
  description: 'In the last few years, large language models have introduced a revolutionary new paradigm in software development. This course demonstrates that modern AI tooling will not only enhance developer productivity but also democratize software engineering for a broader audience.',
  createdAt: new Date('2025-09-01'),
  weeks: [
    {
      id: 'week-1',
      weekNumber: 1,
      title: 'Introduction to Coding LLMs and AI Development',
      topics: [
        'Course logistics',
        'What is an LLM actually',
        'How to prompt effectively'
      ],
      readings: [
        { id: 'r1-1', title: 'Deep Dive into LLMs', url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI', type: 'video' },
        { id: 'r1-2', title: 'Prompt Engineering Overview', url: 'https://cloud.google.com/discover/what-is-prompt-engineering', type: 'article' },
        { id: 'r1-3', title: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/techniques', type: 'article' },
        { id: 'r1-4', title: 'AI Prompt Engineering: A Deep Dive', url: 'https://www.youtube.com/watch?v=T9aRN5JkmL8', type: 'video' },
        { id: 'r1-5', title: 'How OpenAI Uses Codex', url: 'https://cdn.openai.com/pdf/6a2631dc-783e-479b-b1a4-af0cfbd38630/how-openai-uses-codex.pdf', type: 'pdf' }
      ],
      assignments: [
        { id: 'a1-1', title: 'LLM Prompting Playground', url: 'https://github.com/mihail911/modern-software-dev-assignments/tree/master/week1', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 9/22', title: 'Introduction and how an LLM is made', slidesUrl: 'https://docs.google.com/presentation/d/1zT2Ofy88cajLTLkd7TcuSM4BCELvF9qQdHmlz33i4t0' },
        { date: 'Fri 9/26', title: 'Power prompting for LLMs', slidesUrl: 'https://docs.google.com/presentation/d/1MIhw8p6TLGdbQ9TcxhXSs5BaPf5d_h77QY70RHNfeGs' }
      ]
    },
    {
      id: 'week-2',
      weekNumber: 2,
      title: 'The Anatomy of Coding Agents',
      topics: [
        'Agent architecture and components',
        'Tool use and function calling',
        'MCP (Model Context Protocol)'
      ],
      readings: [
        { id: 'r2-1', title: 'MCP Introduction', url: 'https://stytch.com/blog/model-context-protocol-introduction/', type: 'article' },
        { id: 'r2-2', title: 'Sample MCP Server Implementations', url: 'https://github.com/modelcontextprotocol/servers', type: 'article' },
        { id: 'r2-3', title: 'MCP Server Authentication', url: 'https://developers.cloudflare.com/agents/guides/remote-mcp-server/#add-authentication', type: 'article' },
        { id: 'r2-4', title: 'MCP Server SDK', url: 'https://github.com/modelcontextprotocol/typescript-sdk', type: 'article' },
        { id: 'r2-5', title: 'MCP Registry', url: 'https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/', type: 'article' },
        { id: 'r2-6', title: 'MCP Food-for-Thought', url: 'https://www.reillywood.com/blog/apis-dont-make-good-mcp-tools/', type: 'article' }
      ],
      assignments: [
        { id: 'a2-1', title: 'First Steps in the AI IDE', url: 'https://github.com/mihail911/modern-software-dev-assignments/tree/master/week2', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 9/29', title: 'Building a coding agent from scratch', slidesUrl: 'https://docs.google.com/presentation/d/11CP26VhsjnZOmi9YFgLlonzdib9BLyAlgc4cEvC5Fps' },
        { date: 'Fri 10/3', title: 'Building a custom MCP server', slidesUrl: 'https://docs.google.com/presentation/d/1zSC2ra77XOUrJeyS85houg1DU7z9hq5Y4ebagTch-5o' }
      ]
    },
    {
      id: 'week-3',
      weekNumber: 3,
      title: 'The AI IDE',
      topics: [
        'Context management and code understanding',
        'PRDs for agents',
        'IDE integrations and extensions'
      ],
      readings: [
        { id: 'r3-1', title: 'Specs Are the New Source Code', url: 'https://blog.ravi-mehta.com/p/specs-are-the-new-source-code', type: 'article' },
        { id: 'r3-2', title: 'How Long Contexts Fail', url: 'https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html', type: 'article' },
        { id: 'r3-3', title: 'Devin: Coding Agents 101', url: 'https://devin.ai/agents101', type: 'article' },
        { id: 'r3-4', title: 'Getting AI to Work In Complex Codebases', url: 'https://github.com/humanlayer/advanced-context-engineering-for-coding-agents', type: 'article' },
        { id: 'r3-5', title: 'How FAANG Vibe Codes', url: 'https://x.com/rohanpaul_ai/status/1959414096589422619', type: 'article' },
        { id: 'r3-6', title: 'Writing Effective Tools for Agents', url: 'https://www.anthropic.com/engineering/writing-tools-for-agents', type: 'article' }
      ],
      assignments: [
        { id: 'a3-1', title: 'Build a Custom MCP Server', url: 'https://github.com/mihail911/modern-software-dev-assignments/blob/master/week3/assignment.md', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 10/6', title: 'From first prompt to optimal IDE setup', slidesUrl: 'https://docs.google.com/presentation/d/11pQNCde_mmRnImBat0Zymnp8TCS_cT_1up7zbcj6Sjg' },
        { date: 'Fri 10/10', title: 'Guest: Silas Alberti, Head of Research at Cognition', slidesUrl: 'https://docs.google.com/presentation/d/1i0pRttHf72lgz8C-n7DSegcLBgncYZe_ppU7dB9zhUA' }
      ]
    },
    {
      id: 'week-4',
      weekNumber: 4,
      title: 'Coding Agent Patterns',
      topics: [
        'Managing agent autonomy levels',
        'Human-agent collaboration patterns'
      ],
      readings: [
        { id: 'r4-1', title: 'How Anthropic Uses Claude Code', url: 'https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf', type: 'pdf' },
        { id: 'r4-2', title: 'Claude Best Practices', url: 'https://www.anthropic.com/engineering/claude-code-best-practices', type: 'article' },
        { id: 'r4-3', title: 'Awesome Claude Agents', url: 'https://github.com/vijaythecoder/awesome-claude-agents', type: 'article' },
        { id: 'r4-4', title: 'Super Claude', url: 'https://github.com/SuperClaude-Org/SuperClaude_Framework', type: 'article' },
        { id: 'r4-5', title: 'Good Context Good Code', url: 'https://blog.stockapp.com/good-context-good-code/', type: 'article' },
        { id: 'r4-6', title: 'Peeking Under the Hood of Claude Code', url: 'https://medium.com/@outsightai/peeking-under-the-hood-of-claude-code-70f5a94a9a62', type: 'article' }
      ],
      assignments: [
        { id: 'a4-1', title: 'Coding with Claude Code', url: 'https://github.com/mihail911/modern-software-dev-assignments/blob/master/week4/assignment.md', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 10/13', title: 'How to be an agent manager', slidesUrl: 'https://docs.google.com/presentation/d/19mgkwAnJDc7JuJy0zhhoY0ZC15DiNpxL8kchPDnRkRQ' },
        { date: 'Fri 10/17', title: 'Guest: Boris Cherney, Creator of Claude Code', slidesUrl: 'https://docs.google.com/presentation/d/1bv7Zozn6z45CAh-IyX99dMPMyXCHC7zj95UfwErBYQ8' }
      ]
    },
    {
      id: 'week-5',
      weekNumber: 5,
      title: 'The Modern Terminal',
      topics: [
        'AI-enhanced command line interfaces',
        'Terminal automation and scripting'
      ],
      readings: [
        { id: 'r5-1', title: 'Warp University', url: 'https://www.warp.dev/university', type: 'article' },
        { id: 'r5-2', title: 'Warp vs Claude Code', url: 'https://www.warp.dev/university/getting-started/warp-vs-claude-code', type: 'article' },
        { id: 'r5-3', title: 'How Warp Uses Warp to Build Warp', url: 'https://notion.warp.dev/How-Warp-uses-Warp-to-build-Warp-21643263616d81a6b9e3e63fd8a7380c', type: 'article' }
      ],
      assignments: [
        { id: 'a5-1', title: 'Agentic Development with Warp', url: 'https://github.com/mihail911/modern-software-dev-assignments/tree/master/week5', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 10/20', title: 'How to Build a Breakout AI Developer Product', slidesUrl: 'https://docs.google.com/presentation/d/1Djd4eBLBbRkma8rFnJAWMT0ptct_UGB8hipmoqFVkxQ' },
        { date: 'Fri 10/24', title: 'Guest: Zach Lloyd, CEO of Warp' }
      ]
    },
    {
      id: 'week-6',
      weekNumber: 6,
      title: 'AI Testing and Security',
      topics: [
        'Secure vibe coding',
        'History of vulnerability detection',
        'AI-generated test suites'
      ],
      readings: [
        { id: 'r6-1', title: 'SAST vs DAST', url: 'https://www.splunk.com/en_us/blog/learn/sast-vs-dast.html', type: 'article' },
        { id: 'r6-2', title: 'Copilot Remote Code Execution via Prompt Injection', url: 'https://embracethered.com/blog/posts/2025/github-copilot-remote-code-execution-via-prompt-injection/', type: 'article' },
        { id: 'r6-3', title: 'Finding Vulnerabilities in Modern Web Apps', url: 'https://semgrep.dev/blog/2025/finding-vulnerabilities-in-modern-web-apps-using-claude-code-and-openai-codex/', type: 'article' },
        { id: 'r6-4', title: 'Agentic AI Threats', url: 'https://unit42.paloaltonetworks.com/agentic-ai-threats/', type: 'article' },
        { id: 'r6-5', title: 'OWASP Top Ten', url: 'https://owasp.org/www-project-top-ten/', type: 'article' },
        { id: 'r6-6', title: 'Context Rot: Understanding Degradation in AI Context Windows', url: 'https://research.trychroma.com/context-rot', type: 'article' }
      ],
      assignments: [
        { id: 'a6-1', title: 'Writing Secure AI Code', url: 'https://github.com/mihail911/modern-software-dev-assignments/blob/master/week6/assignment.md', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 10/27', title: 'AI QA, SAST, DAST, and Beyond', slidesUrl: 'https://docs.google.com/presentation/d/1C05bCLasMDigBbkwdWbiz4WrXibzi6ua4hQQbTod_8c' },
        { date: 'Fri 10/31', title: 'Guest: Isaac Evans, CEO of Semgrep' }
      ]
    },
    {
      id: 'week-7',
      weekNumber: 7,
      title: 'Modern Software Support',
      topics: [
        'What AI code systems can we trust',
        'Debugging and diagnostics',
        'Intelligent documentation generation'
      ],
      readings: [
        { id: 'r7-1', title: 'Code Reviews: Just Do It', url: 'https://blog.codinghorror.com/code-reviews-just-do-it/', type: 'article' },
        { id: 'r7-2', title: 'How to Review Code Effectively', url: 'https://github.blog/developer-skills/github/how-to-review-code-effectively-a-github-staff-engineers-philosophy/', type: 'article' },
        { id: 'r7-3', title: 'AI-Assisted Assessment of Coding Practices', url: 'https://arxiv.org/pdf/2405.13565', type: 'pdf' },
        { id: 'r7-4', title: 'AI Code Review Implementation Best Practices', url: 'https://graphite.dev/guides/ai-code-review-implementation-best-practices', type: 'article' },
        { id: 'r7-5', title: 'Code Review Essentials for Software Teams', url: 'https://blakesmith.me/2015/02/09/code-review-essentials-for-software-teams.html', type: 'article' },
        { id: 'r7-6', title: 'Lessons from millions of AI code reviews', url: 'https://www.youtube.com/watch?v=TswQeKftnaw', type: 'video' }
      ],
      assignments: [
        { id: 'a7-1', title: 'Code Review Reps', url: 'https://github.com/mihail911/modern-software-dev-assignments/tree/master/week7', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 11/3', title: 'AI code review', slidesUrl: 'https://docs.google.com/presentation/d/1NkPzpuSQt6Esbnr2-EnxM9007TL6ebSPFwITyVY-QxU' },
        { date: 'Fri 11/7', title: 'Guest: Tomas Reimers, CPO of Graphite' }
      ]
    },
    {
      id: 'week-8',
      weekNumber: 8,
      title: 'Automated UI and App Building',
      topics: [
        'Design and frontend for everyone',
        'Rapid UI/UX prototyping and iteration'
      ],
      readings: [],
      assignments: [
        { id: 'a8-1', title: 'Multi-stack Web App Builds', url: 'https://github.com/mihail911/modern-software-dev-assignments/tree/master/week8', type: 'assignment' }
      ],
      lectures: [
        { date: 'Mon 11/10', title: 'End-to-end apps with a single prompt', slidesUrl: 'https://docs.google.com/presentation/d/1GrVLsfMFIXMiGjIW9D7EJIyLYh_-3ReHHNd_vRfZUoo' },
        { date: 'Fri 11/14', title: 'Guest: Gaspar Garcia, Head of AI Research at Vercel', slidesUrl: 'https://docs.google.com/presentation/d/1Jf2aN5zIChd5tT86rZWWqY-iDWbxgR-uynKJxBR7E9E' }
      ]
    },
    {
      id: 'week-9',
      weekNumber: 9,
      title: 'Agents Post-Deployment',
      topics: [
        'Monitoring and observability for AI systems',
        'Automated incident response',
        'Triaging and debugging'
      ],
      readings: [
        { id: 'r9-1', title: 'Introduction to Site Reliability Engineering', url: 'https://sre.google/sre-book/introduction/', type: 'article' },
        { id: 'r9-2', title: 'Observability Basics You Should Know', url: 'https://last9.io/blog/traces-spans-observability-basics/', type: 'article' },
        { id: 'r9-3', title: 'Kubernetes Troubleshooting with AI', url: 'https://resolve.ai/blog/kubernetes-troubleshooting-in-resolve-ai', type: 'article' },
        { id: 'r9-4', title: 'Your New Autonomous Teammate', url: 'https://resolve.ai/blog/product-deep-dive', type: 'article' },
        { id: 'r9-5', title: 'Role of Multi Agent Systems in Making Software Engineers AI-native', url: 'https://resolve.ai/blog/role-of-multi-agent-systems-AI-native-engineering', type: 'article' },
        { id: 'r9-6', title: 'Benefits of Agentic AI in On-call Engineering', url: 'https://resolve.ai/blog/Top-5-Benefits', type: 'article' }
      ],
      assignments: [],
      lectures: [
        { date: 'Mon 11/17', title: 'Incident response and DevOps', slidesUrl: 'https://docs.google.com/presentation/d/1Mfe-auWAsg9URCujneKnHr0AbO8O-_U4QXBVOlO4qp0' },
        { date: 'Fri 11/21', title: 'Guest: Mayank Agarwal, CTO of Resolve' }
      ]
    },
    {
      id: 'week-10',
      weekNumber: 10,
      title: "What's Next for AI Software Engineering",
      topics: [
        'Future of software development roles',
        'Emerging AI coding paradigms',
        'Industry trends and predictions'
      ],
      readings: [],
      assignments: [],
      lectures: [
        { date: 'Mon 12/1', title: 'Software development in 10 years' },
        { date: 'Fri 12/5', title: 'Guest: Martin Casado, General Partner at a16z' }
      ]
    }
  ]
};

export const sampleFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is an LLM?',
    back: 'A Large Language Model (LLM) is a type of artificial intelligence model trained on vast amounts of text data to understand, generate, and process human language. Examples include GPT-4, Claude, and Gemini.',
    weekId: 'week-1',
    mastered: false,
    createdAt: new Date()
  },
  {
    id: 'fc-2',
    front: 'What is prompt engineering?',
    back: 'Prompt engineering is the practice of designing and refining inputs to AI models to elicit desired outputs. It involves techniques like few-shot learning, chain-of-thought prompting, and providing clear context.',
    weekId: 'week-1',
    mastered: false,
    createdAt: new Date()
  },
  {
    id: 'fc-3',
    front: 'What is MCP (Model Context Protocol)?',
    back: 'MCP is a protocol that allows AI agents to interact with external tools and services. It provides a standardized way for LLMs to call functions, access APIs, and integrate with development environments.',
    weekId: 'week-2',
    mastered: false,
    createdAt: new Date()
  },
  {
    id: 'fc-4',
    front: 'What are coding agents?',
    back: 'Coding agents are AI systems that can autonomously write, modify, and debug code. They combine LLMs with tool use capabilities to perform complex software development tasks with minimal human intervention.',
    weekId: 'week-2',
    mastered: false,
    createdAt: new Date()
  },
  {
    id: 'fc-5',
    front: 'What is context management in AI IDEs?',
    back: 'Context management refers to how AI coding tools select, organize, and prioritize code files and documentation to include in prompts. Effective context management improves code understanding and generation quality.',
    weekId: 'week-3',
    mastered: false,
    createdAt: new Date()
  },
  {
    id: 'fc-6',
    front: 'What is SAST vs DAST?',
    back: 'SAST (Static Application Security Testing) analyzes source code for vulnerabilities without running it. DAST (Dynamic Application Security Testing) tests running applications to find security issues through simulated attacks.',
    weekId: 'week-6',
    mastered: false,
    createdAt: new Date()
  }
];
