import { useEffect, useRef, useState } from "react";
import type { KeyboardEventHandler } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Tag,
  Select,
  Switch,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CopyOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ReadOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { message as antdMessage } from "antd";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { getInitialAgentResponse, sendAgentResponse, gradeAnswer } from "./api";
import type { ApiMessage } from "./api";
import type { QuizToolData, ShortAnswerToolData } from "./api";

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Represents a single message in the chat conversation between user and AI tutor.
 *
 * @interface ChatMessage
 * @property {string} id - Unique identifier for the message (typically timestamp-based)
 * @property {'user' | 'tutor'} type - The sender type: 'user' for student messages, 'tutor' for AI responses
 * @property {string} content - The actual message content, supports markdown formatting
 * @property {Date} timestamp - When the message was created, used for ordering and display
 *
 * @example
 * ```typescript
 * const userMessage: ChatMessage = {
 *   id: '1694123456789',
 *   type: 'user',
 *   content: 'What is a vector?',
 *   timestamp: new Date()
 * }
 * ```
 */
export interface ChatMessage {
  id: string;
  type: "user" | "tutor";
  content: string;
  timestamp: Date;
}

/**
 * Configuration props for the ChatTutor component.
 *
 * @interface ChatTutorProps
 * @property {string} currentTopic - The current lesson/topic title displayed in the chat header
 * @property {string} lessonContent - The full lesson content used for context-aware responses
 * @property {string} [initialLessonText] - Optional initial lesson text shown as first tutor message
 *
 * @example
 * ```typescript
 * <ChatTutor
 *   currentTopic="Linear Algebra - Vector Operations"
 *   lessonContent="Vectors are mathematical objects with magnitude and direction..."
 *   initialLessonText="Welcome to vector operations! Let's start with the basics."
 * />
 * ```
 */
interface ChatTutorProps {
  currentTopic: string;
  lessonContent: string;
  initialLessonText?: string;
  moduleName?: string;
  requirements?: string[];
}

/**
 * An intelligent AI tutor chat component that provides context-aware, educational responses.
 *
 * This component creates an interactive learning experience where students can ask questions
 * about lesson content and receive tailored responses based on the current topic, lesson context,
 * and configurable response modes (explain, examples, steps, quiz).
 *
 * Key Features:
 * - Context-aware responses using lesson content
 * - Multiple response modes (explain, examples, steps, quiz)
 * - Adjustable detail levels (concise, normal, deep)
 * - Message history with markdown support
 * - Copy-to-clipboard functionality
 * - Auto-scroll to latest messages
 * - Regenerate last response capability
 * - Quick suggestion buttons
 *
 * @param {ChatTutorProps} props - Configuration for the chat tutor
 * @returns {JSX.Element} The rendered chat interface
 *
 * @example
 * ```typescript
 * <ChatTutor
 *   currentTopic="Vector Operations"
 *   lessonContent="Vectors have magnitude and direction..."
 *   initialLessonText="Welcome to vectors!"
 * />
 * ```
 */
export function ChatTutor({
  currentTopic,
  lessonContent,
  initialLessonText,
  moduleName,
  requirements: incomingRequirements,
}: ChatTutorProps) {
  /**
   * Chat messages state - initialized with welcome message and optional lesson intro.
   * Uses lazy initialization to set up initial conversation context.
   */
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);
  // Linear requirements list and current index
  const derivedRequirements = (() => {
    if (
      Array.isArray(incomingRequirements) &&
      incomingRequirements.length > 0
    ) {
      return incomingRequirements;
    }
    // Fallback: derive simple requirements from first sentences of lesson content
    const sentences = (lessonContent || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((s) => s.trim());
    return sentences.length > 0 ? sentences : [currentTopic];
  })();
  const [currentRequirementIndex, setCurrentRequirementIndex] = useState(0);

  /** Current user input text */
  const [inputValue, setInputValue] = useState("");

  /** Loading state for AI response generation */
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<QuizToolData | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(
    null
  );
  const [activeShortAnswer, setActiveShortAnswer] =
    useState<ShortAnswerToolData | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");
  const [shortAnswerSubmitted, setShortAnswerSubmitted] = useState(false);

  /**
   * Response generation mode affecting the style and focus of tutor responses:
   * - 'explain': Detailed explanations of concepts
   * - 'examples': Concrete examples and demonstrations
   * - 'steps': Step-by-step procedural guidance
   * - 'quiz': Interactive questions and assessments
   */
  const [mode, setMode] = useState<"explain" | "examples" | "steps" | "quiz">(
    "explain"
  );

  /**
   * Detail level for responses:
   * - 'concise': Brief, to-the-point answers
   * - 'normal': Balanced detail level
   * - 'deep': Comprehensive, in-depth explanations
   */
  const [detail, setDetail] = useState<"concise" | "normal" | "deep">("normal");

  /** Whether to include lesson content context in responses */
  const [useContext, setUseContext] = useState(true);

  /** Reference for auto-scrolling to the latest message */
  const endRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll effect to keep the latest message visible.
   * Triggers smooth scrolling whenever new messages are added.
   */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Map UI messages to API messages
  const toApiMessages = (msgs: ChatMessage[]): ApiMessage[] =>
    msgs.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.content,
    }));

  // Build initial system+user messages for initial-response
  const buildInitialMessages = (requirementText: string): ApiMessage[] => {
    const req = (requirementText || currentTopic).trim();
    return [
      {
        role: "system",
        content: `
        You are a Teaching Agent.
        Given a requirement, you will teach the student about the requirement.
        What does this mean?
        1. generate a short informative blurb on the given requirement.
        2. follow this with a short digestable example.

        sometimes, a user will ask you a follow up question. In this case, answer it to the best of your abilities.
                `,
      },
      {
        role: "user",
        content: `Teach me a lesson on "${req}". Include one example`,
      },
    ];
  };

  // Fetch initial agent response on first mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await getInitialAgentResponse(
          buildInitialMessages(
            derivedRequirements[currentRequirementIndex] || currentTopic
          ),
          {
            requirements: derivedRequirements,
            currentRequirementIndex,
            currentModule: moduleName || currentTopic,
          }
        );
        if (!mounted) return;
        const tutorMsg: ChatMessage = {
          id: String(Date.now() + 1),
          type: "tutor",
          content:
            (res.message as any).choices?.[0]?.message?.content ||
            res.message.content ||
            "No response received",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, tutorMsg]);
        const tool = (res.message as any).tool;
        if (tool && tool.type === "quiz") {
          setActiveQuiz(tool.data as QuizToolData);
          setSelectedQuizOption(null);
        } else if (tool && tool.type === "shortAnswer") {
          setActiveShortAnswer(tool.data as ShortAnswerToolData);
          setShortAnswerInput("");
          setShortAnswerSubmitted(false);
        }
      } catch (e: any) {
        const msg = e?.message || "Failed to load initial lesson";
        antdMessage.error(msg);
        appendTutorError(msg);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic]);

  /**
   * Intelligently finds relevant context from lesson content based on user query.
   *
   * This function performs semantic matching by:
   * 1. Extracting keywords from the user's query
   * 2. Searching for sentences containing those keywords
   * 3. Returning the most relevant snippet (max 240 chars)
   *
   * @param {string} query - The user's question or input
   * @returns {string} Relevant context snippet from lesson content, or empty string if none found
   *
   * @example
   * ```typescript
   * // If lessonContent contains "Vectors have magnitude and direction..."
   * findContextSnippet("what is magnitude")
   * // Returns: "Vectors have magnitude and direction. In 2D, you can represent..."
   * ```
   */
  const findContextSnippet = (query: string) => {
    if (!useContext || !lessonContent) return "";

    // Normalize lesson content to single line
    const lc = (lessonContent || "").replace(/\n+/g, " ").trim();

    // Split into sentences for contextual matching
    const sentences = lc.split(/(?<=[.!?])\s+/);

    // Extract meaningful keywords from query (limit to 6 for performance)
    const q = query.toLowerCase();
    const keywords = Array.from(
      new Set(q.split(/[^a-z0-9]+/).filter(Boolean))
    ).slice(0, 6);

    // Find first sentence containing any keyword, fallback to first sentence
    const match =
      sentences.find((s) =>
        keywords.some((k) => s.toLowerCase().includes(k))
      ) || sentences[0];

    // Return truncated snippet
    return (match || "").slice(0, 240);
  };

  /**
   * Generates contextually appropriate tutor responses based on user input and current settings.
   *
   * This is the core AI simulation function that creates educational responses by:
   * 1. Checking for specific topic keywords (vector, matrix, example)
   * 2. Applying current mode (explain/examples/steps/quiz) and detail level
   * 3. Including relevant lesson context when enabled
   * 4. Adding appropriate follow-up suggestions
   *
   * Response Strategy:
   * - Keyword matching for common topics (vectors, matrices)
   * - Mode-specific response templates
   * - Context integration from lesson content
   * - Detail level adjustment (concise/normal/deep)
   * - Educational follow-up questions
   *
   * @param {string} text - The user's input/question
   * @returns {string} Generated tutor response with markdown formatting
   *
   * @example
   * ```typescript
   * // With mode='explain', detail='normal', useContext=true
   * generateTutorResponse("What is a vector?")
   * // Returns: "Here's an explanation focusing on the core idea and common pitfalls.
   * //           Lesson context: 'Vectors have magnitude and direction...'
   * //           Would you like an example, a visual intuition, or a practice problem next?"
   * ```
   */
  const generateTutorResponse = (text: string) => {
    const lower = text.toLowerCase();

    // Direct topic-specific responses for common concepts
    if (lower.includes("vector")) {
      return "A vector has both magnitude and direction. In 2D, you can represent it as (x, y). Its magnitude is sqrt(x^2 + y^2).";
    }
    if (lower.includes("matrix")) {
      return "A matrix is a rectangular array of numbers. Matrix multiplication corresponds to composing linear transformations.";
    }
    if (lower.includes("example")) {
      return "Example: (3,4) + (1,2) = (4,6). The magnitude of (3,4) is 5.";
    }

    // Generate detail-level prefix based on current setting
    const detailBlurb =
      detail === "concise"
        ? "In short: "
        : detail === "deep"
        ? "Let's go deeper: "
        : ""; // Normal detail has no prefix

    // Generate mode-specific response template
    const base =
      mode === "explain"
        ? `${detailBlurb}Here's an explanation focusing on the core idea and common pitfalls.`
        : mode === "examples"
        ? `${detailBlurb}Let's look at a few examples that connect directly to this concept.`
        : mode === "steps"
        ? `${detailBlurb}Here is a step-by-step approach you can follow.`
        : `${detailBlurb}I'll quiz you with a quick question to check understanding.`;

    // Add contextual information from lesson content
    const ctx = findContextSnippet(text);
    const ctxLine = ctx
      ? `\n\nLesson context: "${ctx}${ctx.length >= 240 ? "…" : ""}"`
      : "";

    // Add mode-appropriate follow-up suggestions
    const followUp =
      mode === "quiz"
        ? "\n\nYour turn: Try answering, and I'll give hints if you'd like."
        : "\n\nWould you like an example, a visual intuition, or a practice problem next?";

    return `${base}${ctxLine}${followUp}`;
  };

  /**
   * Handles sending user messages and triggering AI responses.
   *
   * Process flow:
   * 1. Validates input (non-empty after trim)
   * 2. Creates and adds user message to chat
   * 3. Clears input field and shows loading state
   * 4. Simulates AI processing delay (900ms)
   * 5. Generates and adds tutor response
   *
   * @example
   * ```typescript
   * // User types "What is a vector?" and presses Send
   * // Creates user message, shows loading, then adds AI response
   * ```
   */
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Create and add user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      type: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    const combined = [...messages, userMsg];
    setMessages(combined);
    setInputValue("");
    setIsLoading(true);

    try {
      const apiMessages = toApiMessages(combined);
      const res = await sendAgentResponse(apiMessages, {
        requirements: derivedRequirements,
        currentRequirementIndex,
        currentModule: moduleName || currentTopic,
      });
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        type: "tutor",
        content:
          (res.message as any).choices?.[0]?.message?.content ||
          res.message.content ||
          "No response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tutorMsg]);
      const tool = (res.message as any).tool;
      if (tool && tool.type === "quiz") {
        setActiveQuiz(tool.data as QuizToolData);
        setSelectedQuizOption(null);
      } else if (tool && tool.type === "shortAnswer") {
        setActiveShortAnswer(tool.data as ShortAnswerToolData);
        setShortAnswerInput("");
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to get AI response";
      antdMessage.error(msg);
      appendTutorError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Keyboard event handler for the text input area.
   * Enables Enter to send (Shift+Enter for new line).
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - Keyboard event
   */
  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Quick suggestion buttons to help users get started with common requests */
  const suggestions = ["Summarize", "Analogy", "Steps", "Practice", "Quiz"];

  /**
   * Regenerates the last tutor response using the same user input.
   * Useful when users want a different explanation or the response wasn't helpful.
   *
   * Algorithm:
   * 1. Find the most recent user message
   * 2. Generate new response using current settings
   * 3. Replace the last tutor message (or append if none exists)
   *
   * @example
   * ```typescript
   * // User asks "Explain vectors", gets response, clicks Regenerate
   * // Same question processed again with potentially different response
   * ```
   */
  const regenerateLast = async () => {
    const lastUser = [...messages].reverse().find((m) => m.type === "user");
    if (!lastUser) return;
    try {
      setIsLoading(true);
      const res = await sendAgentResponse(toApiMessages(messages), {
        requirements: derivedRequirements,
        currentRequirementIndex,
        currentModule: moduleName || currentTopic,
      });
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        type: "tutor",
        content:
          (res.message as any).choices?.[0]?.message?.content ||
          res.message.content ||
          "No response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tutorMsg]);
      const tool = (res.message as any).tool;
      if (tool && tool.type === "quiz") {
        setActiveQuiz(tool.data as QuizToolData);
        setSelectedQuizOption(null);
      } else if (tool && tool.type === "shortAnswer") {
        setActiveShortAnswer(tool.data as ShortAnswerToolData);
        setShortAnswerInput("");
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to regenerate response";
      antdMessage.error(msg);
      appendTutorError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets the chat conversation to initial state.
   * Clears all messages and shows fresh welcome message for the current topic.
   */
  const resetChat = async () => {
    setMessages([]);
    setActiveQuiz(null);
    setSelectedQuizOption(null);
    setActiveShortAnswer(null);
    setShortAnswerInput("");
    setShortAnswerSubmitted(false);
    try {
      setIsLoading(true);
      const res = await getInitialAgentResponse(
        buildInitialMessages(derivedRequirements[0] || currentTopic),
        {
          requirements: derivedRequirements,
          currentRequirementIndex: 0,
          currentModule: moduleName || currentTopic,
        }
      );
      setCurrentRequirementIndex(0);
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        type: "tutor",
        content:
          (res.message as any).choices?.[0]?.message?.content ||
          res.message.content ||
          "No response received",
        timestamp: new Date(),
      };
      setMessages([tutorMsg]);
      const tool = (res.message as any).tool;
      if (tool && tool.type === "quiz") {
        setActiveQuiz(tool.data as QuizToolData);
        setSelectedQuizOption(null);
      } else if (tool && tool.type === "shortAnswer") {
        setActiveShortAnswer(tool.data as ShortAnswerToolData);
        setShortAnswerInput("");
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to reset chat";
      antdMessage.error(msg);
      appendTutorError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copies message content to clipboard with user feedback.
   * Uses modern Clipboard API with graceful error handling.
   *
   * @param {string} text - The message content to copy
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      antdMessage.success("Copied to clipboard");
    } catch {
      antdMessage.error("Copy failed");
    }
  };

  // Helper: append an assistant error message into chat
  const appendTutorError = (errorText: string) => {
    const tutorMsg: ChatMessage = {
      id: String(Date.now() + 1),
      type: "tutor",
      content: `I couldn't load the lesson just now. You can try Regenerate or Reset.\n\nError: ${errorText}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tutorMsg]);
  };

  return (
    <Card
      title={
        <Space size={8}>
          <RobotOutlined style={{ color: "#1890ff" }} />
          <Text strong>AI Tutor</Text>
          <Tag color="blue">{currentTopic}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Response mode">
            <Select
              size="small"
              style={{ width: 130 }}
              value={mode}
              onChange={(v) => setMode(v)}
              options={[
                {
                  value: "explain",
                  label: (
                    <span>
                      <ReadOutlined /> Explain
                    </span>
                  ),
                },
                {
                  value: "examples",
                  label: (
                    <span>
                      <BulbOutlined /> Examples
                    </span>
                  ),
                },
                {
                  value: "steps",
                  label: (
                    <span>
                      <SettingOutlined /> Steps
                    </span>
                  ),
                },
                {
                  value: "quiz",
                  label: (
                    <span>
                      <QuestionCircleOutlined /> Quiz
                    </span>
                  ),
                },
              ]}
            />
          </Tooltip>
          <Tooltip title="Detail level">
            <Select
              size="small"
              style={{ width: 110 }}
              value={detail}
              onChange={(v) => setDetail(v)}
              options={[
                { value: "concise", label: "Concise" },
                { value: "normal", label: "Normal" },
                { value: "deep", label: "Deep" },
              ]}
            />
          </Tooltip>
          <Tooltip title="Reset chat">
            <Button
              icon={<DeleteOutlined />}
              onClick={resetChat}
              size="small"
            />
          </Tooltip>
        </Space>
      }
      bodyStyle={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        height: 420,
      }}
    >
      {/* Quick actions */}
      {/* <Space wrap style={{ marginBottom: 8 }}>
        {suggestions.map((q) => (
          <Button key={q} size="small" onClick={() => setInputValue(q)}>
            {q}
          </Button>
        ))}
      </Space> */}

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item
              style={{ padding: "8px 0" }}
              actions={[
                <Tooltip title="Copy" key="copy">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(m.content)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={
                      m.type === "user" ? <UserOutlined /> : <RobotOutlined />
                    }
                    style={{
                      background: m.type === "user" ? "#1890ff" : "#52c41a",
                    }}
                  />
                }
                title={
                  <Text strong style={{ fontSize: 12 }}>
                    {m.type === "user" ? "You" : "AI Tutor"}
                  </Text>
                }
                description={
                  <MarkdownRenderer content={m.content} fontSize={17} />
                }
              />
            </List.Item>
          )}
        />
        {activeQuiz && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            <Text strong>Quiz</Text>
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <MarkdownRenderer content={activeQuiz.question} />
            </div>
            <Space wrap>
              {activeQuiz.options.map((opt) => (
                <Button
                  key={opt.label}
                  type={
                    selectedQuizOption === opt.label ? "primary" : "default"
                  }
                  onClick={() => setSelectedQuizOption(opt.label)}
                >
                  {opt.label}: {opt.content}
                </Button>
              ))}
              <Button
                type="dashed"
                disabled={!selectedQuizOption || isLoading}
                onClick={async () => {
                  if (!activeQuiz || !selectedQuizOption) return;
                  const chosen = activeQuiz.options.find(
                    (o) => o.label === selectedQuizOption
                  );
                  const answerText = chosen
                    ? `${chosen.label}: ${chosen.content}`
                    : selectedQuizOption;
                  // Add user's answer to chat
                  const answerMsg: ChatMessage = {
                    id: String(Date.now()),
                    type: "user",
                    content: `My answer: ${answerText}`,
                    timestamp: new Date(),
                  };
                  const combined = [...messages, answerMsg];
                  setMessages(combined);
                  setIsLoading(true);
                  try {
                    const res = await gradeAnswer({
                      question: activeQuiz.question,
                      answer: answerText,
                      messages: toApiMessages(combined),
                    });
                    const tutorMsg: ChatMessage = {
                      id: String(Date.now() + 1),
                      type: "tutor",
                      content: res.response.content,
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, tutorMsg]);
                    setActiveQuiz(null);
                    setSelectedQuizOption(null);
                    // If grading passed, advance to next requirement and fetch new lesson
                    if (
                      res.grading?.passed &&
                      currentRequirementIndex < derivedRequirements.length - 1
                    ) {
                      const nextIndex = currentRequirementIndex + 1;
                      setCurrentRequirementIndex(nextIndex);
                      const next = await getInitialAgentResponse(
                        buildInitialMessages(
                          derivedRequirements[nextIndex] || currentTopic
                        ),
                        {
                          requirements: derivedRequirements,
                          currentRequirementIndex: nextIndex,
                          currentModule: moduleName || currentTopic,
                        }
                      );
                      const nextMsg: ChatMessage = {
                        id: String(Date.now() + 2),
                        type: "tutor",
                        content:
                          (next.message as any).choices?.[0]?.message
                            ?.content ||
                          next.message.content ||
                          "No response received",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, nextMsg]);
                      const nextTool = (next.message as any).tool;
                      if (nextTool && nextTool.type === "quiz") {
                        setActiveQuiz(nextTool.data as QuizToolData);
                        setSelectedQuizOption(null);
                      } else if (nextTool && nextTool.type === "shortAnswer") {
                        setActiveShortAnswer(
                          nextTool.data as ShortAnswerToolData
                        );
                        setShortAnswerInput("");
                      }
                    }
                  } catch (e: any) {
                    const msg = e?.message || "Failed to grade answer";
                    antdMessage.error(msg);
                    appendTutorError(msg);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Submit Answer
              </Button>
            </Space>
          </div>
        )}
        {activeShortAnswer && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            <Text strong>Short Answer Question</Text>
            <div style={{ marginTop: 8, marginBottom: 12 }}>
              <MarkdownRenderer content={activeShortAnswer.question} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <TextArea
                value={shortAnswerInput}
                onChange={(e) => setShortAnswerInput(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                disabled={shortAnswerSubmitted || isLoading}
                style={{ fontSize: 16 }}
              />
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button
                type="primary"
                disabled={
                  !shortAnswerInput.trim() || shortAnswerSubmitted || isLoading
                }
                loading={isLoading}
                onClick={async () => {
                  if (
                    !activeShortAnswer ||
                    !shortAnswerInput.trim() ||
                    shortAnswerSubmitted
                  )
                    return;

                  // Add user's answer to chat
                  const answerMsg: ChatMessage = {
                    id: String(Date.now()),
                    type: "user",
                    content: `My answer: ${shortAnswerInput.trim()}`,
                    timestamp: new Date(),
                  };
                  const combined = [...messages, answerMsg];
                  setMessages(combined);
                  setIsLoading(true);
                  setShortAnswerSubmitted(true);

                  try {
                    const res = await gradeAnswer({
                      question: activeShortAnswer.question,
                      answer: shortAnswerInput.trim(),
                      messages: toApiMessages(combined),
                    });
                    const tutorMsg: ChatMessage = {
                      id: String(Date.now() + 1),
                      type: "tutor",
                      content: res.response.content,
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, tutorMsg]);
                    setActiveShortAnswer(null);
                    setShortAnswerInput("");
                    setShortAnswerSubmitted(false);

                    // If grading passed, advance to next requirement and fetch new lesson
                    if (
                      res.grading?.passed &&
                      currentRequirementIndex < derivedRequirements.length - 1
                    ) {
                      const nextIndex = currentRequirementIndex + 1;
                      setCurrentRequirementIndex(nextIndex);
                      const next = await getInitialAgentResponse(
                        buildInitialMessages(
                          derivedRequirements[nextIndex] || currentTopic
                        ),
                        {
                          requirements: derivedRequirements,
                          currentRequirementIndex: nextIndex,
                          currentModule: moduleName || currentTopic,
                        }
                      );
                      const nextMsg: ChatMessage = {
                        id: String(Date.now() + 2),
                        type: "tutor",
                        content:
                          (next.message as any).choices?.[0]?.message
                            ?.content ||
                          next.message.content ||
                          "No response received",
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, nextMsg]);
                      const nextTool = (next.message as any).tool;
                      if (nextTool && nextTool.type === "quiz") {
                        setActiveQuiz(nextTool.data as QuizToolData);
                        setSelectedQuizOption(null);
                      } else if (nextTool && nextTool.type === "shortAnswer") {
                        setActiveShortAnswer(
                          nextTool.data as ShortAnswerToolData
                        );
                        setShortAnswerInput("");
                        setShortAnswerSubmitted(false);
                      }
                    }
                  } catch (e: any) {
                    const msg = e?.message || "Failed to grade answer";
                    antdMessage.error(msg);
                    appendTutorError(msg);
                    setShortAnswerSubmitted(false); // Allow retry on error
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {shortAnswerSubmitted ? "Submitted" : "Submit Answer"}
              </Button>
            </div>
          </div>
        )}
        {isLoading && (
          <Space style={{ marginTop: 8 }}>
            <Avatar
              icon={<RobotOutlined />}
              style={{ background: "#52c41a" }}
            />
            <Text type="secondary" italic>
              AI Tutor is typing...
            </Text>
          </Space>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <Space.Compact style={{ width: "100%" }}>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder="Ask about this lesson..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ fontSize: 16 }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={regenerateLast}
          disabled={
            isLoading || messages.filter((m) => m.type === "user").length === 0
          }
        >
          Regenerate
        </Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </Button>
      </Space.Compact>
    </Card>
  );
}
