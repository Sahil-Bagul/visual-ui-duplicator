
import { supabase } from "../integrations/supabase/client";
import { Course, Module, Lesson } from "../types/course";

/**
 * Checks if a course with the given title already exists
 */
const courseExists = async (title: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("title", title)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking if course exists:", error);
  }

  return !!data;
};

/**
 * Creates a course with modules and lessons
 */
const createCourse = async (
  course: Course,
  modules: Module[],
  lessonsData: Record<string, Lesson[]>
): Promise<string | null> => {
  try {
    // Step 1: Insert the course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        description: course.description,
        price: course.price,
        image_url: course.image_url,
        level: course.level,
        duration: course.duration,
      })
      .select()
      .single();

    if (courseError) {
      console.error("Error creating course:", courseError);
      return null;
    }

    const courseId = courseData.id;

    // Step 2: Insert modules
    for (const moduleData of modules) {
      const { data: moduleRecord, error: moduleError } = await supabase
        .from("modules")
        .insert({
          course_id: courseId,
          title: moduleData.title,
          description: moduleData.description,
          order_index: moduleData.order_index,
        })
        .select()
        .single();

      if (moduleError) {
        console.error("Error creating module:", moduleError);
        continue;
      }

      // Step 3: Insert lessons for this module
      const moduleId = moduleRecord.id;
      const lessons = lessonsData[moduleData.title] || [];
      
      for (const lesson of lessons) {
        const { error: lessonError } = await supabase.from("lessons").insert({
          module_id: moduleId,
          title: lesson.title,
          content: lesson.content,
          order_index: lesson.order_index,
          duration_minutes: lesson.duration_minutes,
        });

        if (lessonError) {
          console.error("Error creating lesson:", lessonError);
        }
      }
    }

    console.log(`Created course: ${course.title} with ID: ${courseId}`);
    return courseId;
  } catch (error) {
    console.error("Error in createCourse:", error);
    return null;
  }
};

/**
 * Creates the AI Tools Course with all modules and lessons
 */
const createAIToolsCourse = async (): Promise<void> => {
  // Check if course already exists
  const exists = await courseExists("AI Tools for Students");
  if (exists) {
    console.log("AI Tools course already exists, skipping creation");
    return;
  }

  const course: Course = {
    id: "", // Will be assigned by the database
    title: "AI Tools for Students",
    description: "Learn how to leverage AI tools to improve your productivity and academic performance.",
    price: 500, // ₹500
    image_url: "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=500&h=350&fit=crop",
    level: "Beginner",
    duration: "4 hours",
    user_id: null,
    created_at: new Date().toISOString(),
  };

  const modules: Module[] = [
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "Introduction to AI Tools",
      description: "Understanding the basics of AI tools and their applications for students.",
      order_index: 1,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "AI for Research & Writing",
      description: "Using AI tools to enhance your research and writing process.",
      order_index: 2,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "AI for Study & Productivity",
      description: "Leveraging AI to study more efficiently and boost productivity.",
      order_index: 3,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "AI Ethics & Future Skills",
      description: "Understanding ethical considerations and preparing for the future.",
      order_index: 4,
    },
  ];

  const lessonsData: Record<string, Lesson[]> = {
    "Introduction to AI Tools": [
      {
        id: "", // Will be assigned by the database
        module_id: "", // Will be assigned later
        title: "What are AI Tools?",
        content: `
# What are AI Tools?

AI tools are software applications that use artificial intelligence algorithms to perform tasks that typically require human intelligence. These tools can process large amounts of information, recognize patterns, generate content, and even learn from data to improve their performance over time.

## Key Types of AI Tools for Students:

1. **Text Generation AI**: Tools like ChatGPT, Bard, and Claude that can write essays, summaries, and creative content.

2. **Research Assistants**: AI tools that can search and summarize academic papers and provide relevant information.

3. **Study Companions**: Applications that create flashcards, quizzes, and personalized study materials.

4. **Content Enhancement**: Tools that help improve writing quality, grammar, and style.

5. **Visual & Audio AI**: Tools that generate images, edit photos, transcribe audio, and create videos.

## How AI Works (Simplified)

AI tools work by using mathematical models trained on vast datasets to recognize patterns and make predictions. For example, ChatGPT was trained on billions of text examples from the internet, allowing it to understand and generate human-like responses to prompts.

When you use an AI tool, you're essentially accessing these complex models through a user-friendly interface. The tool processes your input, runs it through its algorithms, and produces output based on its training.
        `,
        order_index: 1,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Benefits of AI Tools for Students",
        content: `
# Benefits of AI Tools for Students

AI tools offer numerous advantages that can transform how students learn, research, and complete assignments. Here are the key benefits:

## Time Efficiency
- **Rapid Research**: Find relevant information in seconds instead of hours
- **Quick Drafting**: Generate initial drafts of essays or presentations
- **Automated Summaries**: Condense lengthy materials into key points

## Enhanced Learning
- **Personalized Explanations**: Get concepts explained in a way you understand
- **Interactive Learning**: Engage with AI tutors that adapt to your pace
- **Knowledge Gaps**: Identify and address areas where you need improvement

## Improved Output Quality
- **Writing Enhancement**: Refine grammar, structure, and style
- **Creative Inspiration**: Overcome writer's block with AI-generated ideas
- **Professional Polish**: Create more polished, error-free assignments

## Skill Development
- **Digital Literacy**: Build crucial skills for the AI-integrated workplace
- **Critical Thinking**: Learn to craft effective prompts and evaluate AI outputs
- **Problem-Solving**: Use AI as a tool within your broader solution approach

Remember: AI tools work best when you use them as assistants rather than replacements for your own thinking. The most successful students use AI to enhance their work, not to avoid doing the work altogether.
        `,
        order_index: 2,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Popular AI Tools Overview",
        content: `
# Popular AI Tools Overview

Let's explore some of the most useful AI tools available to students today:

## Large Language Models (LLMs)

### ChatGPT
- **Developer**: OpenAI
- **Best For**: Writing assistance, explanations, brainstorming, coding help
- **Cost**: Free basic version, Premium (Plus) version for ~₹1,600/month
- **Access**: [chat.openai.com](https://chat.openai.com)

### Bard / Gemini
- **Developer**: Google
- **Best For**: Up-to-date information, research help, creative content
- **Cost**: Free with Google account
- **Access**: [gemini.google.com](https://gemini.google.com)

### Claude
- **Developer**: Anthropic
- **Best For**: Long-form content, document analysis, nuanced responses
- **Cost**: Free basic version, Claude Pro for ~₹2,000/month
- **Access**: [claude.ai](https://claude.ai)

## Writing Assistants

### Grammarly
- **Best For**: Grammar correction, style improvement, plagiarism checking
- **Cost**: Free basic version, Premium from ₹1,000/month
- **Access**: [grammarly.com](https://www.grammarly.com)

### QuillBot
- **Best For**: Paraphrasing, summarizing, citation generation
- **Cost**: Free basic version, Premium from ₹500/month
- **Access**: [quillbot.com](https://quillbot.com)

## Research Tools

### Elicit
- **Best For**: Finding relevant academic papers, summarizing research
- **Cost**: Free
- **Access**: [elicit.org](https://elicit.org)

### Consensus
- **Best For**: Getting evidence-based answers from scientific literature
- **Cost**: Free basic version
- **Access**: [consensus.app](https://consensus.app)

## Productivity Tools

### Notion AI
- **Best For**: Note-taking, summarizing, writing within Notion
- **Cost**: ~₹800/month (after Notion subscription)
- **Access**: Within Notion app

### Otter.ai
- **Best For**: Transcribing lectures, meetings, and interviews
- **Cost**: Free basic version, paid plans from ₹850/month
- **Access**: [otter.ai](https://otter.ai)

In the following lessons, we'll explore how to use these tools effectively and ethically.
        `,
        order_index: 3,
        duration_minutes: 20,
      },
    ],
    "AI for Research & Writing": [
      {
        id: "",
        module_id: "",
        title: "Effective Prompting Techniques",
        content: `
# Effective Prompting Techniques

The quality of output you get from AI tools depends significantly on how well you formulate your prompts. Here are strategies to get better results:

## The CRISPE Framework

A powerful approach to structuring your prompts:

1. **C**apacity (Tell the AI what role to play)
   - "Act as a history professor specializing in ancient India"
   - "You are an expert economics tutor explaining concepts to a 1st-year student"

2. **R**equest (Clearly state what you want)
   - "Explain the concept of price elasticity with simple examples"
   - "Create a study guide for chapter 5 on cellular respiration"

3. **I**nstruction (Provide specific guidance)
   - "Use simple language appropriate for high school students"
   - "Include 3-5 practice problems with solutions"
   - "Format your response with headings, bullet points, and examples"

4. **S**pecificity (Include relevant details)
   - "This is for my 12th-grade economics assignment that's due tomorrow"
   - "I'm specifically interested in applications in the healthcare industry"

5. **P**ersonalization (Tailor to your needs)
   - "I'm a visual learner, so include diagrams if possible"
   - "I struggle with mathematical concepts, so provide step-by-step explanations"

6. **E**xamples (Provide examples of what you want)
   - "For instance, I'd like something similar to this: [example]"

## Prompt Examples

### Weak Prompt:
\`\`\`
Explain photosynthesis.
\`\`\`

### Strong Prompt:
\`\`\`
Act as a biology teacher explaining photosynthesis to a 12th-grade student. Provide a comprehensive explanation of the photosynthesis process, including both the light-dependent and light-independent reactions. Include the chemical equations, where the process occurs in the plant cell, and its ecological importance. Use analogies that would help a visual learner understand the concept better. Format your response with clear headings, bullet points for key facts, and include 3 potential exam questions with answers at the end.
\`\`\`

## Iterative Prompting

Remember that you can refine your results through follow-up prompts:

1. Start with an initial prompt
2. Review the AI's response
3. Follow up with: "That's helpful, but could you go deeper on [specific aspect]?"
4. Or: "Please rewrite this at a simpler reading level"
5. Or: "Can you format this as a table instead?"

The most effective AI users engage in multi-turn conversations, refining their requests until they get exactly what they need.
        `,
        order_index: 1,
        duration_minutes: 25,
      },
      {
        id: "",
        module_id: "",
        title: "Research Strategies with AI",
        content: `
# Research Strategies with AI

AI tools can transform your research process, helping you find, understand, and synthesize information more efficiently.

## Finding Relevant Sources

### Using Specialized Research AI
- **Elicit**: Input your research question to find relevant academic papers
- **Consensus**: Ask specific questions to get evidence-based answers from scientific literature
- **Connected Papers**: Discover related research through visual graphs

### Prompting General AI for Research
\`\`\`
I'm researching [topic] for a college assignment. Can you suggest:
1. 5 key subtopics I should explore
2. 10 specific search terms/keywords I should use
3. Names of 5-7 leading experts or authors in this field
4. Names of 3-4 reputable journals that publish on this topic
5. 3 important debates or controversies in this area
\`\`\`

## Understanding Complex Material

When struggling with difficult papers or concepts:

### For Academic Papers
\`\`\`
I'm reading this abstract from an academic paper: [paste abstract]

Please:
1. Explain the main thesis in simpler terms
2. Define any technical terminology
3. Summarize what methods they used
4. Explain what their key findings were
5. Why this research matters (its implications)
\`\`\`

### For Data and Statistics
\`\`\`
Here is some data from my research: [paste table/data]

Please:
1. Explain what trends or patterns you notice
2. What conclusions might be drawn from this data
3. What limitations might exist in interpreting this data
4. Suggest how I might present this visually
\`\`\`

## Synthesizing Information

After gathering information from multiple sources:

\`\`\`
I've collected these key points from different sources about [topic]:

1. [point from source 1]
2. [point from source 2]
3. [point from source 3]

Please help me:
1. Identify common themes across these sources
2. Note any contradictions or disagreements
3. Suggest a framework for organizing these ideas in my paper
4. Identify any apparent gaps in my research
\`\`\`

## Important Reminders

1. **Always verify AI information** with trusted academic sources
2. **Cite original sources**, not the AI tool
3. **Check your institution's policy** on using AI for research
4. **Use AI as a starting point**, not the final authority
5. **Maintain critical thinking** - question and verify AI outputs

AI tools work best when they supplement your research process rather than replace it. They can help you navigate the vast landscape of information, but your critical analysis remains essential.
        `,
        order_index: 2,
        duration_minutes: 20,
      },
      {
        id: "",
        module_id: "",
        title: "Writing Enhancement with AI",
        content: `
# Writing Enhancement with AI

AI tools can significantly improve your writing quality, helping you create more polished, clear, and engaging academic papers, essays, and assignments.

## The Writing Process with AI

### 1. Planning and Outlining
Use AI to brainstorm ideas and create structured outlines:

\`\`\`
I need to write a 1500-word essay on [topic]. Please help me create:
1. A compelling thesis statement
2. An outline with 3-4 main sections
3. Key points to cover in each section
4. Suggestions for types of evidence I should include
\`\`\`

### 2. Drafting with AI Assistance
AI can help generate initial drafts based on your outline:

\`\`\`
Based on this outline:
[paste your outline]

Please write an initial draft of the introduction paragraph that:
- Hooks the reader with an interesting fact/statistic
- Provides necessary background context
- Presents my thesis statement
- Briefly outlines what the paper will cover
\`\`\`

You can request similar assistance for body paragraphs and conclusions.

### 3. Revision and Improvement
AI excels at helping you refine your existing text:

\`\`\`
Please improve this paragraph:
[paste your paragraph]

Specifically:
- Make the language more academic but still clear
- Strengthen the topic sentence
- Ensure smooth transitions between ideas
- Suggest better word choices for any repetitive or vague terms
\`\`\`

### 4. Editing and Proofreading
AI can catch errors and suggest improvements:

\`\`\`
Please proofread this text for:
[paste your text]

1. Grammar and spelling errors
2. Punctuation issues
3. Sentence structure problems
4. Consistency in tense and voice
5. Overly complex or unclear sentences
\`\`\`

## Specialized Writing Assistance

### For Academic Language
\`\`\`
Please help me rephrase these informal statements in more academic language suitable for a university assignment:
1. [informal sentence 1]
2. [informal sentence 2]
3. [informal sentence 3]
\`\`\`

### For Clarity and Conciseness
\`\`\`
These sentences are too wordy or unclear. Please help me make them more concise while preserving their meaning:
1. [wordy sentence 1]
2. [wordy sentence 2]
\`\`\`

### For Paraphrasing
\`\`\`
I need to incorporate this information from a source, but I want to paraphrase it properly:
[paste original text]

Please provide 2-3 different ways to paraphrase this while:
- Maintaining accuracy to the original meaning
- Using different sentence structures
- Changing vocabulary where appropriate
- Ensuring it doesn't look like plagiarism
\`\`\`

## Ethical Considerations

1. **Always review and edit AI-generated content** - it should reflect your voice and thinking
2. **Understand your institution's policy** on AI writing assistance
3. **Develop your own writing skills** alongside using AI
4. **Cite properly** - if the AI helps you summarize a source, you still need to cite that source
5. **Use AI as a tool, not a replacement** for your own critical thinking and expression

When used ethically, AI writing tools can help you focus on your ideas and arguments while improving the technical aspects of your writing.
        `,
        order_index: 3,
        duration_minutes: 25,
      },
      {
        id: "",
        module_id: "",
        title: "Citation and Plagiarism Checking",
        content: `
# Citation and Plagiarism Checking

Proper citation and avoiding plagiarism are critical in academic work. AI tools can help with both creating citations and checking for unintentional plagiarism.

## Creating Citations with AI

### Using Specialized Citation Tools
- **Zotero** (with GPT integration): Manages references and can generate citations
- **Cite This For Me**: Creates citations in various formats
- **Google Scholar**: Provides ready-made citations for academic papers

### Using LLMs for Citations
You can ask AI to format citations for you:

\`\`\`
Please create citations in [APA/MLA/Chicago] format for these sources:

1. Book: "Artificial Intelligence: A Modern Approach" by Stuart Russell and Peter Norvig, published by Pearson in 2021, 4th edition

2. Journal article: "Machine Learning Applications in Education" by Sarah Johnson and Michael Chen, published in Journal of Educational Technology, Volume 45, Issue 3, pages 112-130, published in 2022

3. Website: "The Impact of AI on Future Work" by World Economic Forum, published on their website (weforum.org) on March 15, 2023, accessed on [your access date]
\`\`\`

### Converting Between Citation Styles
If you need to change citation formats:

\`\`\`
Please convert these MLA citations to APA format:
1. [paste MLA citation 1]
2. [paste MLA citation 2]
\`\`\`

## Creating In-Text Citations
For help with in-text citations:

\`\`\`
Please show me how to create proper in-text citations in APA style for these scenarios:
1. Direct quote from page 45 of a book by Smith (2021)
2. Paraphrasing an idea from an article with two authors, Jones and Brown (2022)
3. Referencing information from a source with three or more authors
4. Citing multiple sources that support the same point
5. Citing a source that was cited in another source (secondary source)
\`\`\`

## Checking for Plagiarism

### Using Specialized Tools
- **Turnitin**: The standard in many educational institutions
- **Grammarly Premium**: Includes plagiarism checking
- **Quetext**: Offers plagiarism detection

### Using AI to Check for Unintentional Plagiarism
You can ask an AI to evaluate if your writing might be too close to the original:

\`\`\`
Original source text: [paste original text]

My version: [paste your version]

Please evaluate if my version is sufficiently paraphrased or if it might be considered plagiarism. Suggest improvements to make it more original while maintaining the key information.
\`\`\`

### Having AI Help Identify What Needs Citation
If you're unsure what requires citation:

\`\`\`
Here is a paragraph from my essay: [paste paragraph]

Please identify any statements, facts, statistics, or ideas that would require citation, and explain why they need to be cited.
\`\`\`

## Best Practices for Avoiding Plagiarism

1. **Always cite sources** for facts, data, opinions, and direct quotes
2. **Use quotation marks** for exact wording from sources
3. **Paraphrase thoroughly** by completely recasting the information in your own words
4. **Keep detailed records** of all sources consulted
5. **Consider AI-generated content** - some institutions require disclosure when AI tools were used

## Common Citation Mistakes to Avoid

1. **Incorrect formatting** of citations
2. **Missing information** (like page numbers for direct quotes)
3. **Inconsistent citation style** throughout a document
4. **Failing to cite paraphrased content**
5. **Over-reliance on direct quotes** instead of synthesizing information

Remember that proper citation isn't just about avoiding plagiarism—it's about participating in academic discourse by acknowledging the sources that have informed your thinking.
        `,
        order_index: 4,
        duration_minutes: 20,
      },
    ],
    "AI for Study & Productivity": [
      {
        id: "",
        module_id: "",
        title: "Creating Study Materials with AI",
        content: `
# Creating Study Materials with AI

AI tools can help you create effective, personalized study materials that match your learning style and the specific content you need to master.

## Generating Comprehensive Notes

Ask AI to help organize and expand your existing notes:

\`\`\`
Here are my rough notes from today's lecture on [topic]:
[paste your notes]

Please help me:
1. Organize these into clear sections with headings
2. Expand on key concepts that need more explanation
3. Add definitions for important terms
4. Create a summary of the most important points
5. Format everything in a clean, readable way
\`\`\`

## Creating Flashcards

AI can help you generate effective flashcards for memorization:

\`\`\`
I need to create flashcards to study [topic]. 

Please generate 15 question-answer pairs that cover:
1. Key definitions
2. Important concepts
3. Relationships between ideas
4. Applications of the theory
5. Common exam questions on this topic

Format each as:
Q: [question]
A: [concise answer]
\`\`\`

You can then transfer these to physical flashcards or digital flashcard apps like Anki or Quizlet.

## Generating Practice Questions

Practice testing is one of the most effective study techniques. AI can create custom practice questions:

\`\`\`
I'm studying [topic] at the undergraduate level. Please create:

1. 5 multiple-choice questions with explanations for each answer option
2. 3 short-answer questions that test conceptual understanding
3. 2 essay-style questions that would require integrating multiple concepts
4. 1 case study scenario where I need to apply what I've learned

Include an answer key with detailed explanations.
\`\`\`

## Creating Mind Maps and Visual Aids

If you're a visual learner, ask AI to help structure visual study aids:

\`\`\`
I need to create a mind map about [topic]. Please help me by:

1. Identifying the central concept
2. Listing 4-6 main branches/categories
3. For each branch, suggesting 3-5 subtopics or details
4. Noting important connections between different branches
5. Suggesting any color-coding or visual organization that might help

I'll use this structure to draw my own mind map.
\`\`\`

## Personalized Study Guides

Before exams, create comprehensive study guides:

\`\`\`
I have an exam on [subject/topics] in two weeks. Please create a comprehensive study guide that includes:

1. A list of all key topics and concepts to master
2. Explanations of the most difficult concepts
3. Formulas or equations I need to memorize
4. A suggested study schedule breaking the material into manageable sections
5. Different types of practice questions
6. Memory techniques for difficult-to-remember information
7. Common pitfalls or mistakes to avoid
\`\`\`

## Summarizing Complex Materials

When dealing with difficult readings or textbooks:

\`\`\`
I'm struggling to understand this textbook chapter: [paste excerpt or describe content]

Please:
1. Summarize the main points in simpler language
2. Explain the key concepts as if teaching a beginner
3. Provide real-world examples that illustrate these concepts
4. Create an analogy that would help me understand and remember this
5. Suggest questions I should be able to answer if I understand this material
\`\`\`

## Study Tips

1. **Actively engage** with AI-generated materials - don't just passively read them
2. **Customize the output** to match your learning style and needs
3. **Use the AI iteratively** - refine requests based on what you get
4. **Mix AI assistance with traditional methods** for better retention
5. **Create materials progressively** - start with basic understanding and build up complexity

Remember that creating study materials is itself a valuable learning exercise. Use AI to enhance this process, not to bypass the learning opportunity it represents.
        `,
        order_index: 1,
        duration_minutes: 25,
      },
      {
        id: "",
        module_id: "",
        title: "AI as a Study Partner",
        content: `
# AI as a Study Partner

AI can serve as an always-available study partner that adapts to your needs, helps you work through problems, and keeps you accountable to your learning goals.

## Socratic Teaching

One of the most powerful ways to use AI for learning is to engage in Socratic dialogue:

\`\`\`
I'm trying to understand [concept]. Rather than just explaining it to me, could you use the Socratic method to help me think through it? Ask me guiding questions, give me hints when I'm stuck, and help me reach my own understanding.
\`\`\`

Example interaction:
You: "I'm trying to understand how natural selection works in evolution."
AI: "Let's explore that together. What do you already know about natural selection?"
You: [share your current understanding]
AI: "Good start. Now, what do you think happens in a population when some individuals have traits that help them survive better than others?"
...and so on

## Problem-Solving Assistance

When stuck on homework or practice problems:

\`\`\`
I'm working on this problem and I'm stuck:
[paste problem]

Here's what I've tried so far:
[describe your attempt]

Here's where I'm getting confused:
[explain your confusion]

Please don't solve it completely for me, but give me:
1. A hint about what concept I should apply
2. A suggestion for a different approach
3. A similar but simpler example that might help me understand
\`\`\`

## Exam Preparation

For targeted exam preparation:

\`\`\`
I have an exam on [subject] in [timeframe]. The format will be [describe format].

The main topics covered will be:
1. [topic 1]
2. [topic 2]
3. [topic 3]

Please act as my study coach and:
1. Create a realistic study schedule
2. Ask me challenging questions about each topic
3. Give me constructive feedback on my answers
4. Help me identify and address knowledge gaps
5. Provide memory techniques for the most challenging content
\`\`\`

## Simulated Discussion Partner

To deepen your understanding through discussion:

\`\`\`
I want to discuss [topic/theory] to deepen my understanding. Please role-play as a knowledgeable peer student who has a good grasp of this topic.

Ask me thoughtful questions about the topic, challenge my understanding respectfully, and offer alternative perspectives. If I make any factual errors, gently correct me. Try to make our discussion feel like a natural conversation between classmates.
\`\`\`

## Accountability Coach

To help maintain motivation and track progress:

\`\`\`
I'm working on [assignment/project/exam prep] with the following goals:
1. [goal 1 with deadline]
2. [goal 2 with deadline]
3. [goal 3 with deadline]

Please act as my accountability coach by:
1. Checking in on my progress
2. Helping me break tasks into manageable steps
3. Providing encouragement when I'm struggling
4. Suggesting strategies when I face obstacles
5. Celebrating my successes
\`\`\`

## Learning Style Adaptation

To get explanations tailored to your learning style:

\`\`\`
I'm trying to understand [concept] but I'm having trouble. I learn best through [visual examples/practical applications/analogies to everyday life/step-by-step processes/etc.].

Could you explain this concept in a way that matches my learning style?
\`\`\`

## Concept Mapping

To connect new concepts with what you already know:

\`\`\`
I'm learning about [new concept]. I already understand these related concepts:
1. [familiar concept 1]
2. [familiar concept 2]

Can you help me connect this new concept to what I already know? How is it similar to or different from these familiar concepts? What are the key relationships I should understand?
\`\`\`

## Best Practices

1. **Be honest about your understanding** - AI works best when it knows your actual level
2. **Take breaks from AI** - traditional study methods and human interaction remain valuable
3. **Use AI to supplement, not replace, your thinking** - the goal is to build your understanding
4. **Verify important information** with course materials and instructors
5. **Maintain agency in your learning** - direct the AI rather than just consuming its output

When used effectively, AI can be like having a patient, knowledgeable study partner available 24/7 to support your learning journey.
        `,
        order_index: 2,
        duration_minutes: 20,
      },
      {
        id: "",
        module_id: "",
        title: "Productivity Systems with AI",
        content: `
# Productivity Systems with AI

AI tools can transform how you manage your academic workload, helping you stay organized, prioritize effectively, and maximize your productive time.

## Creating Personalized Productivity Systems

AI can help you design systems tailored to your needs:

\`\`\`
I need help creating a productivity system for managing my college workload. Here's my situation:

- I'm taking [list courses]
- I have [list commitments] outside of class
- My energy is highest in the [morning/afternoon/evening]
- I struggle most with [your challenges]
- My goals this term are [your goals]

Please suggest:
1. A daily/weekly schedule template
2. A task management approach that would work for me
3. Study blocks and break schedules
4. How to track assignments and deadlines
5. Strategies for handling my specific challenges
\`\`\`

## Time Blocking and Scheduling

For help with time management:

\`\`\`
I need to create a time-blocked schedule for next week. Here are my commitments:

- Classes: [list with times]
- Work: [list with times]
- Assignments due: [list with deadlines]
- Other commitments: [list with times]

Please help me create a daily schedule that includes:
1. Dedicated study blocks for each subject
2. Time for assignment work
3. Breaks and self-care
4. Buffer time for unexpected issues
5. Preparation time before classes
\`\`\`

## Task Prioritization

When overwhelmed with too many tasks:

\`\`\`
I'm feeling overwhelmed with all these tasks. Please help me prioritize them using the Eisenhower Matrix (urgent/important framework):

[List all your tasks]

For each task, please categorize it as:
1. Urgent and important (do immediately)
2. Important but not urgent (schedule time)
3. Urgent but not important (delegate if possible)
4. Neither urgent nor important (eliminate or minimize)

Then suggest an action plan for tackling them efficiently.
\`\`\`

## Project Planning and Breakdown

For large assignments or projects:

\`\`\`
I have a [type of assignment] on [topic] due on [date]. It's approximately [length/scope].

Please help me:
1. Break this project into smaller, manageable tasks
2. Create a timeline working backward from the due date
3. Suggest milestones to check my progress
4. Identify resources I'll need at each stage
5. Flag potential challenges I might face and how to prepare for them
\`\`\`

## Focus and Distraction Management

For improving concentration:

\`\`\`
I struggle with [specific distraction issues] when trying to study. Based on current research on focus and productivity, please suggest:

1. Specific techniques to improve my concentration
2. Environmental adjustments I could make
3. Digital tools to block distractions
4. Study methods that work well for people with attention challenges
5. A progressive plan to build my focus muscle over time
\`\`\`

## Creating Accountability Systems

For motivation and tracking:

\`\`\`
I need an accountability system to make sure I'm making progress on my goals. My main academic goals this term are:

[List your goals]

Please help me design:
1. A tracking system to monitor my progress
2. Regular check-in questions I should ask myself
3. Meaningful rewards for hitting milestones
4. Recovery plans for if I fall behind
5. How to measure my success beyond just grades
\`\`\`

## Habit Building for Academic Success

For developing good study habits:

\`\`\`
I want to build these study habits:
1. [habit 1]
2. [habit 2]
3. [habit 3]

For each habit, please help me:
1. Break it down into a tiny, easy-to-start version
2. Identify potential triggers or cues
3. Design a reward system
4. Create a plan for tracking
5. Suggest how to handle inevitable lapses
\`\`\`

## Productivity Tips for Specific Subjects

For tailored approaches to different subjects:

\`\`\`
I'm studying [subject] and finding it challenging to be productive with this material. Can you suggest specific productivity techniques or approaches that work particularly well for this type of subject matter?
\`\`\`

## Best Practices

1. **Start small** and build up - don't try to overhaul your entire system at once
2. **Experiment and iterate** - be willing to adapt what doesn't work
3. **Consider your personal working style** - not every productivity trend will work for you
4. **Build in flexibility** - rigid systems often fail under pressure
5. **Use technology wisely** - digital tools should reduce friction, not add complexity

Remember that productivity is personal. The best system is one that you'll actually use consistently, so focus on sustainability rather than complexity.
        `,
        order_index: 3,
        duration_minutes: 20,
      },
    ],
    "AI Ethics & Future Skills": [
      {
        id: "",
        module_id: "",
        title: "Ethical Use of AI in Education",
        content: `
# Ethical Use of AI in Education

As AI tools become increasingly integrated into educational settings, it's crucial to use them ethically and responsibly.

## Understanding Academic Integrity

### What Constitutes Academic Dishonesty with AI?
- **Submitting AI-generated work as your own** without significant contribution
- **Using AI to complete assessments** designed to test your knowledge
- **Having AI solve problems** without understanding the solution
- **Misrepresenting your use of AI** when required to disclose it

### What Constitutes Ethical AI Use?
- **Using AI as a learning assistant** to help you understand concepts
- **Employing AI for brainstorming and ideation**
- **Having AI provide feedback** on your own work
- **Using AI to organize or format** information you've researched
- **Disclosing AI use** when required by your institution

## Institutional Policies

### Common Institutional Approaches
1. **Prohibition**: Some institutions ban AI use entirely for assignments
2. **Disclosure**: Some require students to disclose when and how AI was used
3. **Integration**: Some actively incorporate AI tools into the curriculum
4. **Case-by-case**: Some leave it to individual instructors' discretion

### Checking Your Institution's Policy
- Review your course syllabi for AI policies
- Check your institution's academic integrity guidelines
- Ask instructors directly about their expectations
- When in doubt, disclose your use of AI tools

## Ethical Decision-Making Framework

When considering whether to use AI for an academic task, ask yourself:

1. **Purpose Test**: What is the educational purpose of this assignment? Will using AI undermine that purpose?

2. **Learning Test**: Will using AI enhance my learning or bypass it?

3. **Disclosure Test**: Would I be comfortable telling my instructor exactly how I used AI for this task?

4. **Fairness Test**: Does using AI in this way give me an unfair advantage over other students?

5. **Future Test**: Will this approach prepare me for future academic or career success?

## Transparency and Documentation

### Best Practices for Transparent AI Use
- **Keep records** of your interactions with AI tools
- **Save original AI outputs** before your revisions
- **Be prepared to explain** your process including AI assistance
- **Document your own contributions** clearly
- **Be honest about limitations** in your understanding

### Sample AI Use Disclosure Statement
\`\`\`
In completing this assignment, I used [AI tool] to assist with [specific aspects]. 
The AI helped me [what it did], but all final decisions, edits, and conclusions are 
my own. I have verified all information provided by the AI against reliable sources,
and I understand the material presented in this work.
\`\`\`

## Balancing AI Assistance with Personal Growth

### Signs You May Be Over-Relying on AI
- You don't understand the final product you're submitting
- You couldn't reproduce the work without AI assistance
- You're using AI to avoid challenging aspects of learning
- You're not developing the skills the assignment is designed to build

### Healthy Integration Strategies
- Use AI to enhance understanding, then complete work independently
- Have AI explain concepts, then apply them yourself
- Use AI for feedback on work you've already attempted
- Treat AI as a tutor or study partner, not a substitute for your own efforts

Remember that the goal of education is not just completing assignments, but developing your own knowledge, skills, and abilities. AI should support that growth, not replace it.
        `,
        order_index: 1,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Limitations and Risks of AI Tools",
        content: `
# Limitations and Risks of AI Tools

While AI tools offer tremendous benefits, they also come with significant limitations and risks that students must understand.

## Technical Limitations

### Hallucinations and Fabrications
- AI can **generate false information** that sounds convincing
- It may **invent citations, quotes, and references** that don't exist
- It can **create plausible-sounding but incorrect explanations**

### Knowledge Cutoffs
- Most AI models have a **knowledge cutoff date**
- They may not know about **recent events, research, or discoveries**
- Information about **niche or specialized topics** may be limited or outdated

### Contextual Understanding
- AI may **misunderstand the context** of your request
- It might **miss nuances** in complex topics
- It can **struggle with highly technical or specialized terminology**

## Verification Strategies

### For Factual Information
1. **Cross-check key facts** with reliable academic sources
2. **Verify all statistics and data** mentioned by the AI
3. **Confirm all references and citations** exist and say what the AI claims
4. **Be extra cautious about recent developments** (post-knowledge cutoff)
5. **Check information about specialized fields** with field-specific resources

### For Conceptual Understanding
1. **Test your understanding** by applying concepts to new examples
2. **Explain the concept in your own words** to check comprehension
3. **Compare AI explanations** with course materials and textbooks
4. **Identify contradictions** between different AI responses
5. **Ask human experts** (professors, TAs) when in doubt

## Inherent Biases

### Types of AI Bias
- **Training data bias**: AI reflects biases in its training materials
- **Historical bias**: AI may perpetuate historical inequities
- **Representation bias**: Some perspectives may be overrepresented
- **Algorithmic bias**: The way AI processes information can introduce bias

### Detecting and Mitigating Bias
1. **Question mainstream perspectives** presented as universal truths
2. **Ask for multiple perspectives** on controversial topics
3. **Be alert to Western or Global North centrism** in explanations
4. **Compare AI outputs** with diverse academic sources
5. **Explicitly ask about biases** that might be present in responses

## Privacy and Security Concerns

### What You Should Know
- Information shared with AI tools **may be stored and used for training**
- There may be **limited privacy protections** depending on the service
- Some institutions or workplaces **may have policies against** sharing certain information

### Best Practices
1. **Don't share personal or sensitive information** (yours or others')
2. **Avoid sharing confidential academic or research data**
3. **Be aware of the privacy policies** of the AI tools you use
4. **Consider using institutional AI tools** that may have better privacy protections
5. **Be especially cautious with proprietary or unpublished work**

## Over-Reliance Risks

### Academic Skill Development
- **Critical thinking skills** may not develop fully
- **Writing abilities** might stagnate
- **Problem-solving approaches** could become formulaic
- **Research skills** may remain underdeveloped

### Professional Readiness
- Employers expect graduates to have **independent capabilities**
- You may face situations where **AI tools aren't available**
- **Fundamental understanding** is necessary for advanced work
- **Creative and original thinking** remains distinctly human

## Maintaining Agency

1. **Use AI deliberately**, not habitually
2. **Practice skills independently** before seeking AI assistance
3. **Set clear boundaries** for when you'll use AI and when you won't
4. **Regularly reflect** on how AI is affecting your learning
5. **Take breaks from AI tools** to assess your own abilities

Remember: AI tools should augment your intelligence, not replace it. The goal is to become a more capable thinker with AI as your assistant—not to become dependent on AI for tasks you should be able to perform.
        `,
        order_index: 2,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Future of AI in Education and Work",
        content: `
# Future of AI in Education and Work

AI is rapidly transforming both educational environments and the workplace. Understanding these changes helps you prepare for a future where AI integration will be ubiquitous.

## Emerging Trends in AI Education

### Personalized Learning Experiences
- **Adaptive learning platforms** that adjust to your pace and style
- **Custom curriculum generation** based on your strengths and gaps
- **AI tutors** that provide one-on-one support at scale
- **Continuous assessment** rather than point-in-time testing

### Changing Educational Models
- **Flipped classrooms** where content delivery happens via AI
- **Project-based learning** with AI supporting complex challenges
- **Collaborative AI** that works alongside student teams
- **Skills verification** through AI-monitored demonstrations

### Evolving Assessment Methods
- **AI-proof assignments** focusing on uniquely human capabilities
- **Process-focused evaluation** rather than just final products
- **Competency demonstrations** instead of traditional exams
- **Portfolio-based assessment** showing applied learning

## How Work is Changing with AI

### Jobs Most Impacted
- **Routine cognitive work** being automated or augmented
- **Data analysis and reporting** increasingly AI-assisted
- **Content production** partially automated
- **Customer service** using AI for first-level responses
- **Administrative tasks** streamlined through AI

### Jobs Least Impacted (For Now)
- Roles requiring **complex human interaction**
- Positions needing **high emotional intelligence**
- Work demanding **creative problem-solving**
- Jobs that involve **physical dexterity** in unstructured environments
- Roles requiring **ethical judgment** and wisdom

### New Jobs Emerging
- **AI prompt engineering** and optimization
- **AI output evaluation** and quality control
- **AI ethics** and governance
- **Human-AI collaboration** specialists
- **AI training** and implementation experts

## Essential Human Skills in an AI World

### Technical Skills
- **AI literacy**: Understanding AI capabilities and limitations
- **Prompt engineering**: Crafting effective instructions for AI systems
- **AI output evaluation**: Critically assessing AI-generated content
- **Data literacy**: Understanding how data influences AI systems
- **Technical adaptability**: Quickly learning new AI tools as they emerge

### Cognitive Skills
- **Critical thinking**: Evaluating information regardless of source
- **Complex problem framing**: Defining problems AI can help solve
- **Systems thinking**: Understanding interconnected components
- **Creativity**: Generating truly novel ideas beyond recombination
- **Judgment**: Making decisions with incomplete information

### Human Skills
- **Emotional intelligence**: Understanding and managing emotions
- **Interpersonal communication**: Building genuine human connections
- **Ethical reasoning**: Making value-based judgments AI cannot
- **Cultural awareness**: Navigating diverse human contexts
- **Empathy**: Truly understanding others' experiences

## Preparing for an AI-Integrated Future

### Educational Strategies
1. **Focus on uniquely human capabilities** in your studies
2. **Develop AI collaboration skills** by practice
3. **Learn to verify and validate** AI outputs
4. **Build your own knowledge foundation** independent of AI
5. **Practice explaining AI concepts** to demonstrate understanding

### Career Preparation
1. **Identify AI trends** in your intended field
2. **Develop complementary skills** AI cannot easily replicate
3. **Learn to articulate your value** beyond what AI provides
4. **Build portfolios showing AI-human collaboration**
5. **Stay current with AI developments** in your industry

### Ethical Leadership
1. **Consider implications** of AI systems before implementation
2. **Advocate for responsible AI use** in your environments
3. **Represent human perspectives** in technology discussions
4. **Balance efficiency** with humanity and compassion
5. **Ensure diversity and inclusion** in AI development and use

The future belongs not to those who fear or avoid AI, but to those who learn to work with it effectively while maintaining their unique human capabilities and perspective.
        `,
        order_index: 3,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Building a Personal AI Toolkit",
        content: `
# Building a Personal AI Toolkit

Creating your own customized AI toolkit will help you maximize the benefits of AI while aligning with your specific needs, preferences, and ethical boundaries.

## Assessing Your Needs

### Questions to Consider
1. What types of academic tasks do you regularly perform?
2. Where do you currently struggle or spend the most time?
3. What are your institution's policies on AI use?
4. What is your budget for paid AI tools?
5. What specific learning or productivity goals do you have?

### Common Academic Use Cases
- **Writing assistance** (drafting, editing, feedback)
- **Research support** (finding sources, summarizing information)
- **Study aids** (creating materials, practice questions)
- **Organization and productivity** (planning, scheduling)
- **Concept explanation** (clarifying difficult topics)
- **Language support** (translation, grammar help)

## Selecting the Right AI Tools

### General-Purpose LLMs
Choose at least one based on your needs:
- **ChatGPT** (Free/Plus): Great all-around capabilities
- **Google Gemini** (Free/Advanced): Strong for current information
- **Claude** (Free/Pro): Excellent for longer contexts and nuanced responses
- **Perplexity** (Free/Pro): Built-in citation capabilities

### Specialized Tools
Consider adding these based on specific needs:
- **Grammarly/QuillBot** (Free/Premium): Writing assistance
- **Elicit/Consensus** (Free tiers): Research support
- **Otter.ai** (Free/Premium): Transcription for lectures
- **Notion AI** (Paid): Note-taking with AI integration
- **Evernote AI** (Subscription): Note organization and enhancement

### Budget Considerations
If budget is limited:
1. Use free versions of major LLMs
2. Prioritize one paid tool that addresses your biggest pain point
3. Look for student discounts
4. Consider sharing premium subscriptions with classmates where allowed

## Creating Custom Prompts Library

Develop a personal collection of effective prompts for regular tasks:

### Study Prompts
\`\`\`
I'm studying [topic] and need to prepare for an exam. Please create a comprehensive study guide covering the key concepts, formulas, and potential exam questions.
\`\`\`

### Writing Prompts
\`\`\`
Please review this paragraph for clarity, coherence, and academic style. Suggest improvements while maintaining my voice and meaning: [your paragraph]
\`\`\`

### Research Prompts
\`\`\`
I'm researching [topic] for a paper. Please suggest 10 specific search terms, 5 key concepts to explore, and 3 potential thesis angles.
\`\`\`

### Productivity Prompts
\`\`\`
I need to complete these assignments by these deadlines: [list]. Please help me create a realistic schedule that breaks these into manageable tasks.
\`\`\`

## Establishing Personal AI Guidelines

Create your own rules for ethical and effective AI use:

### Sample Personal Guidelines
1. I will not use AI to complete assignments testing my knowledge
2. I will verify all factual information from AI with reliable sources
3. I will disclose my AI use according to my institution's policies
4. I will use AI to enhance my learning, not replace my thinking
5. I will regularly practice skills independently to ensure development

## Integration with Your Workflow

### Effective Integration Strategies
1. **Designated AI time**: Schedule specific times for AI consultation
2. **Pre-work enhancement**: Use AI to prepare before starting tasks
3. **Post-work refinement**: Have AI review and suggest improvements
4. **Learning reinforcement**: Use AI to test your understanding
5. **Progress tracking**: Document how AI helps achieve your goals

## Continuous Improvement

### Refining Your AI Approach
1. **Review AI interactions**: Which were most helpful?
2. **Identify patterns**: Where does AI consistently add value?
3. **Refine prompts**: Improve based on previous results
4. **Explore new tools**: Test emerging AI capabilities
5. **Share techniques**: Exchange strategies with peers

### Evaluating Tool Effectiveness
Periodically ask:
- Is this tool saving me time?
- Is it improving my academic performance?
- Am I learning effectively while using it?
- Does it fit within my ethical boundaries?
- Is it worth the cost (time, money, privacy)?

## Final Recommendations

1. **Start small** with 2-3 core tools before expanding
2. **Document effective prompts** for future use
3. **Balance AI assistance** with independent work
4. **Regularly reassess** your toolkit as needs change
5. **Stay informed** about new AI capabilities and limitations

Remember that your AI toolkit should evolve as your needs change, your skills develop, and AI technology advances. The goal is to create a personalized system that enhances your learning and productivity while aligning with your values and academic requirements.
        `,
        order_index: 4,
        duration_minutes: 15,
      },
    ],
  };

  // Create the course with its modules and lessons
  await createCourse(course, modules, lessonsData);
};

/**
 * Creates the Stock Market Basics Course with all modules and lessons
 */
const createStockMarketCourse = async (): Promise<void> => {
  // Check if course already exists
  const exists = await courseExists("Stock Market Basics");
  if (exists) {
    console.log("Stock Market course already exists, skipping creation");
    return;
  }

  const course: Course = {
    id: "", // Will be assigned by the database
    title: "Stock Market Basics",
    description: "Learn the fundamentals of stock market investing with practical, beginner-friendly lessons.",
    price: 1000, // ₹1000
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=350&fit=crop",
    level: "Beginner",
    duration: "5 hours",
    user_id: null,
    created_at: new Date().toISOString(),
  };

  const modules: Module[] = [
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "Getting Started with Stocks",
      description: "Understanding the fundamentals of stock markets and how they work.",
      order_index: 1,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "Investment Basics",
      description: "Learn the core concepts and strategies for beginner investors.",
      order_index: 2,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "Market Analysis",
      description: "Understanding how to analyze stocks and make informed decisions.",
      order_index: 3,
    },
    {
      id: "", // Will be assigned by the database
      course_id: "", // Will be assigned later
      title: "Building Your Portfolio",
      description: "Practical steps to create and manage your investment portfolio.",
      order_index: 4,
    },
  ];

  const lessonsData: Record<string, Lesson[]> = {
    "Getting Started with Stocks": [
      {
        id: "", // Will be assigned by the database
        module_id: "", // Will be assigned later
        title: "What is the Stock Market?",
        content: `
# What is the Stock Market?

The stock market is a collection of exchanges where shares of publicly held companies are bought and sold. These financial activities are conducted through formal exchanges (like NSE and BSE in India) and over-the-counter (OTC) marketplaces that operate under defined rules.

## Key Concepts

### Stocks (Shares)
- A stock represents partial ownership in a company
- When you buy a stock, you become a shareholder
- Owning shares gives you certain rights, including potential dividends and voting rights

### Stock Exchanges
- **National Stock Exchange (NSE)**: India's leading stock exchange
- **Bombay Stock Exchange (BSE)**: One of Asia's oldest exchanges
- These provide the infrastructure for trading stocks in a regulated environment

### Market Participants
- **Retail Investors**: Individual investors like you
- **Institutional Investors**: Banks, mutual funds, insurance companies
- **Brokers**: Intermediaries who execute trades
- **Market Makers**: Provide liquidity to the market

## How the Stock Market Works

1. **Companies Issue Shares**: Through an Initial Public Offering (IPO), companies sell shares to raise capital for growth, research, or paying off debt.

2. **Exchanges List Shares**: Once public, shares are listed on exchanges where they can be traded.

3. **Buyers and Sellers Trade**: Investors buy and sell these shares based on their assessment of the company's current value and future prospects.

4. **Price Determination**: Stock prices are determined by supply and demand - when more people want to buy than sell, prices rise, and vice versa.

## Why the Stock Market Matters

- **Capital Formation**: Helps companies raise money for growth
- **Wealth Creation**: Allows individuals to participate in company growth
- **Economic Indicator**: Often reflects the health of the economy
- **Investment Avenue**: Offers potential returns higher than traditional savings

## Common Misconceptions

- **Not Just for the Wealthy**: Even small amounts can be invested
- **Not Just Gambling**: Though risky, investing is different from speculation when based on research
- **Not Just Short-term**: The real benefits often come from long-term investing

## Getting Started

To participate in the stock market, you'll need:
- A trading and demat account with a registered broker
- Basic understanding of how to evaluate stocks
- A clear investment strategy
- Patience and emotional discipline

In the upcoming lessons, we'll explore each of these aspects in detail to prepare you for successful investing.
        `,
        order_index: 1,
        duration_minutes: 20,
      },
      {
        id: "",
        module_id: "",
        title: "Why Invest in Stocks?",
        content: `
# Why Invest in Stocks?

Investing in stocks offers numerous potential benefits, especially when compared to traditional investment options available in India. Let's explore why stocks deserve consideration in your investment portfolio.

## Potential for Higher Returns

- **Historical Performance**: Over the long term, stocks have historically outperformed many other investment classes like fixed deposits, gold, and bonds.
  
- **Compounding Growth**: When invested for long periods, returns can compound significantly, turning even modest investments into substantial sums.

- **Real Examples**: ₹10,000 invested in HDFC Bank in 2000 would be worth over ₹9,00,000 today - far outpacing inflation and traditional savings.

## Beating Inflation

- **Purchasing Power Protection**: While fixed deposits might offer 5-6% returns, with inflation at 4-6%, your real returns are minimal. Stocks have historically provided returns that beat inflation.

- **Growth Participation**: As the economy grows, companies grow, and as a shareholder, you participate in this growth.

## Ownership in Real Businesses

- **Partial Ownership**: When you buy stocks, you're buying a piece of an actual business.

- **Dividend Income**: Many established companies share profits with shareholders through dividends.

- **Voting Rights**: Shareholders can vote on important company matters.

## Liquidity Advantages

- **Easy to Sell**: Unlike real estate or some bonds, stocks can typically be sold quickly when you need funds.

- **Transparent Pricing**: You can see the current value of your investments at any time.

## Accessibility

- **Low Entry Barrier**: You can start investing with as little as ₹500 in some cases.

- **Fractional Investments**: Many platforms now allow buying fractions of expensive shares.

## Tax Benefits

- **Long-term Capital Gains**: Stocks held for more than one year benefit from either tax exemption (up to ₹1 lakh per year) or lower tax rates (10% above that threshold).

- **ELSS Funds**: Equity Linked Savings Schemes offer tax benefits under Section 80C while providing exposure to stocks.

## Diversification Benefits

- **Portfolio Stability**: Adding stocks to a portfolio of fixed-income investments can actually reduce overall risk through diversification.

- **Global Exposure**: Through Indian companies with global operations or funds that invest internationally, you gain exposure to global economic growth.

## Building Real Wealth

Historical data shows that for building significant wealth over decades, stocks have been one of the most effective vehicles for ordinary individuals.

## The Psychological Factor

- **Financial Education**: Investing in stocks encourages learning about businesses, economics, and finance.

- **Discipline Building**: Regular investing builds financial discipline and long-term thinking.

## Balancing the Picture: Risks

It's important to acknowledge that stocks come with risks:

- **Volatility**: Prices can fluctuate significantly in the short term
- **Company-specific risks**: Individual businesses can fail
- **Market risks**: Entire markets can decline during economic downturns

However, these risks can be managed through proper research, diversification, and a long-term perspective - topics we'll cover in later lessons.

Remember: Stocks are just one component of a well-balanced financial plan, but they're a component that's difficult to replace when building wealth over the long term.
        `,
        order_index: 2,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Types of Stocks and Market Terminology",
        content: `
# Types of Stocks and Market Terminology

Understanding stock market terminology is essential for navigating the investment landscape. This lesson covers the most important terms and types of stocks you'll encounter.

## Basic Stock Classifications

### By Company Size (Market Capitalization)

- **Large-Cap Stocks**: Companies valued at ₹20,000+ crore
  - Examples: Reliance Industries, TCS, HDFC Bank
  - Characteristics: More stable, established businesses, often pay dividends

- **Mid-Cap Stocks**: Companies valued between ₹5,000-20,000 crore
  - Examples: Federal Bank, Jubilant FoodWorks
  - Characteristics: Balance of growth potential and stability

- **Small-Cap Stocks**: Companies valued under ₹5,000 crore
  - Characteristics: Higher growth potential but also higher risk

### By Investment Style

- **Growth Stocks**: Companies expected to grow earnings faster than the market
  - Focus: Rapid revenue and profit growth
  - Example: Asian Paints, which has consistently expanded its business

- **Value Stocks**: Companies trading below their intrinsic value
  - Focus: Strong fundamentals but currently underpriced
  - Example: PSU banks during certain periods

- **Income/Dividend Stocks**: Companies that regularly distribute earnings to shareholders
  - Focus: Stable income through dividends
  - Examples: ITC, Power Grid, which offer higher dividend yields

### By Sectors

- **Technology**: IT services, software companies (TCS, Infosys)
- **Financial**: Banks, insurance, NBFCs (HDFC Bank, ICICI Bank)
- **Consumer**: FMCG, retail, auto (Hindustan Unilever, Maruti)
- **Healthcare**: Pharmaceuticals, hospitals (Sun Pharma, Apollo Hospitals)
- **Energy**: Oil & gas, power generation (Reliance, NTPC)
- **Manufacturing**: Industrial goods, engineering (L&T, Tata Steel)

## Key Stock Market Terms

### Trading Terminology

- **Bull Market**: A market characterized by rising prices and optimism
- **Bear Market**: A market characterized by falling prices and pessimism
- **Rally**: A rapid increase in market prices
- **Correction**: A decline of 10% or more from recent highs
- **Volume**: The number of shares traded in a given period

### Investment Metrics

- **P/E Ratio (Price-to-Earnings)**: Stock price divided by earnings per share
- **EPS (Earnings Per Share)**: Company's profit divided by outstanding shares
- **Dividend Yield**: Annual dividends per share divided by price per share
- **Book Value**: Company's assets minus liabilities
- **Market Cap**: Total value of all outstanding shares

### Order Types

- **Market Order**: Buy or sell at the current best available price
- **Limit Order**: Buy or sell only at a specified price or better
- **Stop Loss**: Order to sell a stock when it reaches a specified price

### Corporate Actions

- **Dividend**: Distribution of company profits to shareholders
- **Bonus Issue**: Free additional shares to existing shareholders
- **Rights Issue**: Opportunity to buy additional shares at a discount
- **Stock Split**: Increasing the number of shares while reducing price proportionally

## Stock Indices

Indices are baskets of stocks that represent a particular market or segment:

- **NIFTY 50**: Represents the 50 largest companies on the NSE
- **SENSEX**: 30 largest and most actively traded stocks on the BSE
- **NIFTY Bank**: Represents the 12 most liquid banking stocks
- **NIFTY Midcap 100**: Represents 100 mid-sized companies

## Understanding Stock Price Movements

Stock prices move based on:

1. **Company Performance**: Earnings, growth prospects, management decisions
2. **Industry Trends**: Developments affecting an entire sector
3. **Economic Factors**: Interest rates, inflation, GDP growth
4. **Market Sentiment**: Overall investor psychology and risk appetite
5. **Global Events**: International trade, geopolitical developments

## Common Terms You'll Hear in News

- **Bloodbath**: Significant market decline
- **All-time High/Low**: Highest or lowest price level ever reached
- **Profit Booking**: Selling stocks to realize gains after a price increase
- **Short Covering**: Buying shares to close out short positions
- **Circuit Breaker**: Temporary trading halt due to extreme price movements

Understanding these terms will help you follow market news, communicate with other investors, and make more informed decisions as you begin your investment journey.
        `,
        order_index: 3,
        duration_minutes: 25,
      },
    ],
    "Investment Basics": [
      {
        id: "",
        module_id: "",
        title: "Creating Your Trading Account",
        content: `
# Creating Your Trading Account

To start investing in the Indian stock market, you'll need to set up the right accounts. This lesson guides you through the process of getting started.

## Required Accounts for Stock Trading

### 1. Trading Account
- Facilitates buying and selling of securities
- Provided by a stockbroker registered with SEBI

### 2. Demat Account (Depository Account)
- Holds your shares in electronic form
- Similar to a bank account, but for securities
- Maintained by depositories (NSDL or CDSL)

### 3. Bank Account
- Linked to your trading account
- Used for fund transfers for buying stocks and receiving sale proceeds

Most brokers offer all three accounts as a 3-in-1 package for convenience.

## Types of Brokers in India

### Full-Service Brokers
- **Features**: Provide research, advice, relationship manager
- **Examples**: ICICI Direct, HDFC Securities, Kotak Securities
- **Costs**: Higher brokerage fees (typically 0.3-0.5% per trade)
- **Best for**: New investors needing guidance

### Discount Brokers
- **Features**: Basic trading platform, minimal frills
- **Examples**: Zerodha, Upstox, Groww, Angel One
- **Costs**: Much lower fees (flat ₹0-20 per trade)
- **Best for**: Cost-conscious traders, self-directed investors

## Steps to Open Your Trading & Demat Account

### 1. Choose a Suitable Broker
- Consider factors like:
  - Brokerage charges
  - Platform usability
  - Customer service
  - Research quality
  - Additional fees

### 2. Gather Required Documents
- PAN Card (mandatory)
- Aadhaar Card
- Address proof (if different from Aadhaar)
- Income proof (sometimes required)
- Bank account details
- Passport-sized photographs

### 3. Complete KYC Process
Most brokers now offer digital KYC through:
- Video verification
- Aadhaar-based e-KYC
- In-person verification (less common now)

### 4. Account Activation
- Sign the account opening form (digital or physical)
- Complete in-person verification if required
- Pay account opening charges if applicable

### 5. Setup Trading Platform
- Download broker's trading app
- Set up login credentials
- Link your bank account
- Deposit initial funds

## Important Considerations When Choosing a Broker

### Costs to Compare
- **Account Opening Fees**: One-time cost (₹0-500)
- **Maintenance Fees**: Annual demat account charges (₹0-750)
- **Brokerage**: Cost per transaction
- **Other Charges**: DP charges, call & trade fees, etc.

### Platform Features
- Ease of use
- Research tools
- Charting capabilities
- Order types supported
- Mobile app quality

### Security Features
- Two-factor authentication
- Encryption standards
- Insurance protection

## Funding Your Account

- Most brokers offer multiple deposit options:
  - UPI
  - NEFT/RTGS
  - Payment gateways

- Start with an amount you're comfortable with
- Avoid investing all your funds at once

## Common Questions About Trading Accounts

### How long does account opening take?
With digital KYC, accounts can be activated in 1-2 days. Traditional processes might take 3-7 days.

### Is there a minimum deposit required?
Most brokers don't require a minimum deposit, but you need sufficient funds to buy the stocks you want.

### Can I have multiple trading accounts?
Yes, you can open accounts with different brokers.

### What happens if my broker goes bankrupt?
Your shares are safe in your demat account. Only keep necessary trading funds with the broker.

## Tips for New Account Holders

1. **Start with the basics**: Learn the platform before making complex trades
2. **Enable all security features**: Protect your account with all available security options
3. **Keep records**: Maintain documentation of all your transactions
4. **Understand charges**: Review your contract note and account statements regularly

Once your accounts are set up, you'll be ready to make your first investment, which we'll cover in upcoming lessons.
        `,
        order_index: 1,
        duration_minutes: 15,
      },
      {
        id: "",
        module_id: "",
        title: "Understanding Risk and Return",
        content: `
# Understanding Risk and Return

The relationship between risk and return is fundamental to investing. This lesson explores how they work together and how to find your personal balance.

## The Risk-Return Relationship

### The Basic Principle
- Higher potential returns generally come with higher risks
- Lower-risk investments typically offer lower returns
- There's no such thing as a high-return, risk-free investment

### Visual Representation
On the risk-return spectrum:
- Fixed deposits (lowest risk, lowest return)
- Government bonds (low risk, low return)
- Corporate bonds (moderate risk, moderate return)
- Blue-chip stocks (moderate-high risk, moderate-high return)
- Small-cap stocks (high risk, potentially high return)
- Speculative investments (highest risk, potentially highest return)

## Types of Investment Risks

### Market Risk
- Affects the entire market
- Caused by economic changes, political events, etc.
- Cannot be eliminated through diversification
- Example: 2020 COVID-19 crash affected almost all stocks

### Company-Specific Risk
- Affects only particular companies or sectors
- Caused by business issues, competition, management changes
- Can be reduced through diversification
- Example: A pharmaceutical company failing drug trials

### Inflation Risk
- The risk that investment returns won't keep pace with inflation
- Particularly affects fixed-income investments
- Example: 6% FD returns with 6% inflation means 0% real return

### Liquidity Risk
- Difficulty selling an investment quickly without loss
- Higher in small-cap stocks, real estate
- Example: Small-cap shares with few buyers when you need to sell

### Currency Risk
- Applies to international investments
- Changes in exchange rates affecting returns
- Example: US stocks declining in rupee terms despite dollar gains

## Measuring Risk

### Volatility
- How much a stock's price varies over time
- Typically measured by standard deviation
- Higher volatility = higher risk
- Example: A stock that moves 3% daily vs. one that moves 0.5%

### Beta
- Measures a stock's volatility compared to the market
- Beta > 1: More volatile than the market
- Beta < 1: Less volatile than the market
- Example: TCS (low beta) vs. Yes Bank (high beta)

## Understanding Returns

### Types of Returns

#### Capital Appreciation
- Growth in the price of your investment
- Example: Buying a share at ₹100 that grows to ₹150

#### Dividend Income
- Periodic payouts from company profits
- Example: Receiving ₹3 per share annually as dividend

#### Total Return
- Capital appreciation + dividends
- The complete picture of investment performance

### Calculating Returns

#### Absolute Return
- Simple percentage change: (Final Value - Initial Value) / Initial Value × 100
- Example: Investment grows from ₹10,000 to ₹12,000 = 20% absolute return

#### Annualized Return (CAGR)
- Compound Annual Growth Rate over multiple years
- Formula: (Final Value / Initial Value)^(1/number of years) - 1
- Example: ₹10,000 becomes ₹16,000 after 4 years = 12.5% CAGR

#### Inflation-Adjusted (Real) Return
- Nominal return minus inflation rate
- What your money can actually buy
- Example: 12% return - 5% inflation = 7% real return

## Finding Your Risk Tolerance

Your risk tolerance depends on:

### Time Horizon
- Longer time horizons can withstand more volatility
- Short-term needs require lower-risk investments

### Financial Goals
- Critical goals (education, retirement) may warrant lower risk
- Aspirational goals might accept higher risk

### Personal Comfort
- Your emotional reaction to market downturns
- Ability to stay invested during volatility

### Financial Situation
- Emergency funds and stable income allow for more risk
- High financial obligations suggest lower risk

## Building a Portfolio Based on Risk-Return Balance

### Conservative Portfolio (Lower Risk)
- 70-80% Large-cap stocks and index funds
- 10-20% Fixed income
- 5-10% Cash
- Suitable for: Near-term goals, low risk tolerance

### Moderate Portfolio (Balanced Risk)
- 40-60% Large-cap stocks
- 20-30% Mid-cap stocks
- 10-20% Fixed income
- Suitable for: Medium-term goals, average risk tolerance

### Aggressive Portfolio (Higher Risk)
- 40-50% Mid-cap stocks
- 20-30% Small-cap stocks
- 20-30% Large-cap stocks
- Suitable for: Long-term goals, high risk tolerance

## Key Takeaways

1. **No free lunch**: Higher returns require accepting higher risk
2. **Know yourself**: Understand your personal risk tolerance
3. **Time matters**: Longer time horizons can absorb more risk
4. **Diversification helps**: It reduces certain types of risk
5. **Real returns matter**: Always consider inflation
6. **Risk changes**: Regularly reassess your risk tolerance as life changes

In the next lessons, we'll explore how to analyze stocks and build a diversified portfolio aligned with your risk tolerance.
        `,
        order_index: 2,
        duration_minutes: 20,
      },
      {
        id: "",
        module_id: "",
        title: "Investment Strategies for Beginners",
        content: `
# Investment Strategies for Beginners

Developing a sound investment strategy is crucial for successful investing. This lesson introduces proven strategies that work well for beginners in the Indian stock market.

## Long-Term vs. Short-Term Investing

### Long-Term Investing (Recommended for Beginners)
- **Time Horizon**: 5+ years
- **Focus**: Company fundamentals, growth potential
- **Advantages**: 
  - Less affected by market volatility
  - Lower transaction costs and taxes
  - Benefits from compounding
  - Requires less monitoring
- **Example**: Buying HDFC Bank shares to hold for a decade

### Short-Term Trading
- **Time Horizon**: Days to months
- **Focus**: Price movements, technical patterns
- **Challenges**: 
  - Requires more time and expertise
  - Higher transaction costs and taxes
  - More stressful and emotional
  - Often lower probability of success
- **Not recommended** for beginners

## Proven Beginner-Friendly Strategies

### 1. Systematic Investment Plan (SIP)
- **What it is**: Regular, fixed amount investments at set intervals
- **How it works**: 
  - Invest ₹2,000-5,000 monthly in selected stocks or funds
  - Benefits from rupee-cost averaging (buying more shares when prices are low)
- **Benefits**: 
  - Disciplined approach
  - Reduces impact of market timing
  - Manageable for small investors
- **Example**: Monthly ₹5,000 investment in Nifty 50 index fund

### 2. Index Investing
- **What it is**: Buying funds that track market indices
- **How it works**: 
  - Invest in Nifty 50 or Sensex index funds/ETFs
  - Get exposure to India's largest companies in one investment
- **Benefits**: 
  - Instant diversification
  - Lower costs than active funds
  - Eliminates stock selection risk
  - Historically outperforms most active strategies
- **Example**: UTI Nifty Index Fund, HDFC Sensex ETF

### 3. Blue-Chip Focus Strategy
- **What it is**: Investing in established, financially sound companies
- **How it works**: 
  - Buy shares of 8-10 leading companies across different sectors
  - Focus on companies with strong balance sheets and consistent performance
- **Benefits**: 
  - Lower volatility than broader market
  - Better downside protection
  - Often pay dividends
- **Example Portfolio**: HDFC Bank, TCS, Asian Paints, Hindustan Unilever, Reliance

### 4. Core and Satellite Strategy
- **What it is**: Combining stable investments with growth opportunities
- **How it works**: 
  - Core (70-80%): Index funds, blue-chip stocks
  - Satellite (20-30%): Selected growth stocks or sector funds
- **Benefits**: 
  - Balances stability and growth
  - Allows some active management while controlling risk
- **Example**: 
  - Core: Nifty 50 index fund (70%)
  - Satellite: 2-3 promising mid-cap stocks (30%)

## Practical Implementation Steps

### 1. Define Your Investment Goals
- **Long-term wealth**: Focus on growth-oriented strategies
- **Regular income**: Consider dividend stocks
- **Specific financial goal**: Calculate required returns and plan accordingly

### 2. Allocate Funds Properly
- **Emergency fund first**: Keep 6 months' expenses in liquid funds/savings
- **Only then invest**: Use only surplus funds for stock investments
- **Start small**: Begin with amounts you're comfortable with

### 3. Choose Your Entry Approach
- **Lump sum**: Good during market corrections
- **Staggered entry**: Divide your capital into 3-6 parts and invest over time
- **SIP**: Best for monthly income earners

### 4. Create a Simple Investment Policy
Write down:
- Your investment goals
- Risk tolerance
- Time horizon
- Strategy you're following
- Criteria for buying/selling

## Common Beginner Mistakes to Avoid

### 1. Chasing Hot Tips
- **Problem**: Acting on unverified recommendations
- **Solution**: Do your own research or stick to index funds

### 2. Overdiversification
- **Problem**: Buying too many stocks dilutes performance
- **Solution**: For beginners, 8-12 quality stocks or 2-3 funds are sufficient

### 3. Frequent Portfolio Checking
- **Problem**: Leads to emotional decisions during volatility
- **Solution**: Review quarterly for long-term investments

### 4. Lack of Patience
- **Problem**: Expecting quick returns leads to disappointment
- **Solution**: Focus on 5+ year performance, not daily movements

## Strategy Adjustment Timeline

- **First 6 months**: Start with index or blue-chip investments
- **6-12 months**: Learn and add selective additional investments
- **1-2 years**: Refine strategy based on experience and research
- **2+ years**: Develop your personal investment philosophy

## Key Takeaways

1. **Begin with simplicity**: Index funds and blue-chips offer the easiest start
2. **Consistency matters more than timing**: Regular investing beats market timing
3. **Patience is crucial**: The best returns come from time in the market
4. **Start small but start now**: The power of compounding works best with time
5. **Follow a plan, not emotions**: Documented strategies prevent emotional mistakes

In the next lessons, we'll explore how to analyze individual stocks for those interested in direct equity investments.
        `,
        order_index: 3,
        duration_minutes: 20,
      },
    ],
    "Market Analysis": [
      {
        id: "",
        module_id: "",
        title: "Fundamental Analysis Basics",
        content: `
# Fundamental Analysis Basics

Fundamental analysis involves evaluating a company's financial health, business model, competitive position, and growth prospects to determine its intrinsic value. This lesson covers the essential elements of fundamental analysis for beginners.

## Key Financial Statements to Understand

### 1. Income Statement
- **What it shows**: Revenue, expenses, and profit over a specific period
- **Key metrics to examine**:
  - Revenue growth (year-over-year)
  - Gross margin (gross profit/revenue)
  - Net profit margin (net profit/revenue)
  - Earnings per share (EPS)

### 2. Balance Sheet
- **What it shows**: Company's assets, liabilities, and shareholders' equity at a point in time
- **Key metrics to examine**:
  - Debt-to-equity ratio
  - Current ratio (current assets/current liabilities)
  - Return on equity (net income/shareholders' equity)
  - Cash and cash equivalents

### 3. Cash Flow Statement
- **What it shows**: Cash generated and used during a period
- **Key metrics to examine**:
  - Operating cash flow
  - Free cash flow
  - Cash flow vs. reported profits
  - Capital expenditures

## Important Fundamental Ratios

### Valuation Ratios
- **P/E Ratio (Price-to-Earnings)**
  - Formula: Share price / Earnings per share
  - What it means: How much investors are willing to pay for each rupee of earnings
  - Interpretation: Lower is potentially better value, but varies by industry
  - Example: TCS with P/E of 30 vs. industry average of 25

- **P/B Ratio (Price-to-Book)**
  - Formula: Share price / Book value per share
  - What it means: Price relative to company's accounting value
  - Useful for: Financial companies, asset-heavy businesses
  - Example: SBI with P/B of 1.5 vs. private banks at 3-4

- **Dividend Yield**
  - Formula: Annual dividend per share / Share price × 100
  - What it means: Percentage return from dividends alone
  - Interpretation: Higher yields may indicate better income but check sustainability
  - Example: Power Grid offering 4% yield vs. market average of 1.5%

### Profitability Ratios
- **Return on Equity (ROE)**
  - Formula: Net income / Shareholders' equity × 100
  - What it means: How efficiently company uses shareholders' money
  - Good range: 15-20% or higher consistently
  - Example: Asian Paints with 25% ROE vs. industry average of 15%

- **Operating Margin**
  - Formula: Operating profit / Revenue × 100
  - What it means: Profitability from core business operations
  - Look for: Stability or improvement over time
  - Example: HUL with 24% operating margin vs. smaller FMCG at 15%

### Financial Health Ratios
- **Debt-to-Equity**
  - Formula: Total debt / Shareholders' equity
  - What it means: Leverage and financial risk
  - Generally safer: Below 1 (varies by industry)
  - Example: IT companies often below 0.1 vs. infrastructure firms at 2+

- **Interest Coverage Ratio**
  - Formula: EBIT / Interest expense
  - What it means: Ability to pay interest obligations
  - Safe zone: Above 3
  - Example: Company with ratio of 7 can pay interest 7 times over

## Qualitative Analysis Factors

### Management Quality
- Track record of delivering on promises
- Transparency in communications
- Skin in the game (promoter ownership)
- Dividend and capital allocation history

### Competitive Advantages (Moats)
- **Brand power**: Strong consumer loyalty (e.g., Asian Paints)
- **Network effects**: Value increases with users (e.g., IndiaMART)
- **Switching costs**: Difficult for customers to change (e.g., TCS)
- **Cost advantages**: Able to produce at lower costs (e.g., Maruti Suzuki)

### Industry Analysis
- Market size and growth rate
- Competitive intensity
- Regulatory environment
- Barriers to entry

### Business Model Evaluation
- Revenue predictability and recurring nature
- Scalability without proportional cost increases
- Working capital requirements
- Pricing power with customers

## Step-by-Step Fundamental Analysis Process

### 1. Industry Selection
- Identify growing industries with favorable long-term trends
- Understand industry-specific metrics and averages
- Example: IT services, consumer staples, private banking

### 2. Company Screening
- Use screeners to filter based on basic criteria:
  - Consistent profitability (5+ years)
  - Low/manageable debt
  - Reasonable valuation relative to growth
  - Decent ROE (15%+)

### 3. Deep Financial Analysis
- Review 5 years of financial statements
- Look for trends rather than single-year figures
- Compare against industry peers
- Check for red flags (accounting changes, qualified audit reports)

### 4. Qualitative Assessment
- Study annual reports, especially management discussion
- Listen to conference calls if available
- Research management background and track record
- Understand competitive position in the industry

### 5. Valuation
- Estimate fair value using:
  - P/E comparison to historical average and peers
  - Discounted cash flow (more advanced)
  - Asset-based valuation (for certain industries)

### 6. Investment Decision
- Buy only if trading at discount to estimated fair value
- Consider position sizing based on conviction
- Document your investment thesis

## Resources for Fundamental Analysis

### Information Sources
- Company annual reports and investor presentations
- Screeners: Screener.in, Trendlyne, Tijori Finance
- Financial websites: Moneycontrol, ValueResearchOnline
- Regulatory filings on BSE/NSE websites

### Key Metrics by Sector
- **Banking**: NPA ratio, NIM, CASA ratio, credit growth
- **FMCG**: Volume growth, distribution reach, gross margin
- **IT Services**: Client concentration, attrition rate, utilization
- **Manufacturing**: Capacity utilization, raw material costs

## Common Mistakes in Fundamental Analysis

1. **Focusing only on P/E ratio** without considering growth or quality
2. **Ignoring cash flows** while fixating on reported profits
3. **Not comparing within industry context** (each industry has different norms)
4. **Overemphasizing recent results** rather than long-term trends
5. **Neglecting qualitative factors** like management and competitive position

In the next lesson, we'll explore technical analysis as a complementary approach to fundamental analysis.
        `,
        order_index: 1,
        duration_minutes: 30,
      },
      {
        id: "",
        module_id: "",
        title: "Technical Analysis Overview",
        content: `
# Technical Analysis Overview

Technical analysis involves studying price movements and trading volumes to identify patterns and trends that may indicate future price behavior. This lesson provides a beginner-friendly introduction to technical analysis concepts.

## Fundamental vs. Technical Analysis

### Fundamental Analysis:
- Focuses on company financials and business strength
- Determines intrinsic value of a stock
- Long-term oriented (months to years)
- Answers: "What to buy?"

### Technical Analysis:
- Focuses on price and volume patterns
- Identifies entry and exit points
- Short to medium-term oriented (days to months)
- Answers: "When to buy or sell?"

Many successful investors use both approaches: fundamental analysis to select stocks and technical analysis to time their entries and exits.

## Core Principles of Technical Analysis

### 1. Price Discounts Everything
- All known information is reflected in the price
- Market participants' collective wisdom drives prices
- No need to analyze news separately

### 2. Prices Move in Trends
- Trends tend to continue rather than reverse
- Identifying trend direction is crucial
- Three types: uptrend, downtrend, and sideways

### 3. History Tends to Repeat
- Market patterns recur due to similar investor psychology
- Recognizable patterns can help predict future movements
- Past support/resistance levels often remain relevant

## Essential Technical Analysis Tools

### Price Charts
- **Types of charts**:
  - Line charts: Simplest, shows closing prices
  - Bar charts: Shows open, high, low, close (OHLC)
  - Candlestick charts: More visual representation of OHLC
  - Point and figure: Focus on price changes, ignores time

- **Timeframes**:
  - Intraday: 1-minute to 1-hour (very short-term)
  - Daily: Most commonly used
  - Weekly/Monthly: For longer-term perspective

### Trend Analysis

- **Uptrend**: Series of higher highs and higher lows
  - Strategy: Buy on pullbacks to support
  
- **Downtrend**: Series of lower highs and lower lows
  - Strategy: Sell on rebounds to resistance

- **Sideways/Range**: Price moves between support and resistance
  - Strategy: Buy near support, sell near resistance

- **Trend Lines**: Diagonal lines connecting highs or lows
  - Uptrend line: Connects higher lows
  - Downtrend line: Connects lower highs
  - Breakout: When price crosses the trend line

### Support and Resistance

- **Support**: Price level where buying pressure exceeds selling pressure
  - Often previous lows or round numbers (e.g., ₹500, ₹1000)
  - Strategy: Consider buying near support levels

- **Resistance**: Price level where selling pressure exceeds buying pressure
  - Often previous highs or round numbers
  - Strategy: Consider booking profits near resistance

- **Role Reversal**: Support becomes resistance after breakdown; resistance becomes support after breakout

### Moving Averages

- **What they are**: Average price over a specific period
  - Simple Moving Average (SMA): Equal weight to all prices
  - Exponential Moving Average (EMA): More weight to recent prices

- **Common periods**:
  - 50-day MA: Intermediate trend
  - 200-day MA: Long-term trend

- **Trading signals**:
  - Golden Cross: 50-day crosses above 200-day (bullish)
  - Death Cross: 50-day crosses below 200-day (bearish)
  - Price above MA: Bullish
  - Price below MA: Bearish

### Volume Analysis

- **Volume**: Number of shares traded in a period
  - Rising price + rising volume = strong trend
  - Rising price + falling volume = weakening trend
  - Falling price + rising volume = strong downtrend
  - Falling price + falling volume = weakening downtrend

- **Volume precedes price**: Often volume changes happen before price changes
  - High volume at support = potential reversal
  - Volume spike on breakout = more reliable breakout

## Common Chart Patterns

### Reversal Patterns

- **Head and Shoulders**
  - Formation: Higher high (head) between two lower highs (shoulders)
  - Signal: Breakdown below neckline indicates reversal from uptrend to downtrend
  - Target: Distance from head to neckline, projected downward

- **Double Top/Bottom**
  - Formation: Two peaks at similar levels (top) or two troughs (bottom)
  - Signal: Break of neckline confirms reversal
  - Common in: Range-bound markets transitioning to trends

### Continuation Patterns

- **Flags and Pennants**
  - Formation: Brief consolidation after strong move
  - Signal: Continuation in original direction after breakout
  - Duration: Usually short-term (few days to weeks)

- **Triangles**
  - Ascending: Higher lows, flat tops (bullish)
  - Descending: Lower highs, flat bottoms (bearish)
  - Symmetric: Converging trend lines (follows prevailing trend)

## Popular Technical Indicators

### Momentum Indicators

- **Relative Strength Index (RSI)**
  - Range: 0 to 100
  - Overbought: Above 70
  - Oversold: Below 30
  - Divergence: Price makes new high but RSI doesn't (bearish)

- **Moving Average Convergence Divergence (MACD)**
  - Components: MACD line, signal line, histogram
  - Bullish signal: MACD crosses above signal line
  - Bearish signal: MACD crosses below signal line

### Volatility Indicators

- **Bollinger Bands**
  - Components: 20-day MA with bands 2 standard deviations above/below
  - Signals: 
    - Price touching upper band = potential resistance
    - Price touching lower band = potential support
    - Bands narrowing = decreased volatility, potential breakout coming

## Practical Application for Beginners

### Starting Steps
1. **Learn to identify trends** first (uptrend, downtrend, sideways)
2. **Recognize basic support and resistance** levels
3. **Use simple moving averages** (50-day and 200-day)
4. **Add one momentum indicator** (RSI is beginner-friendly)
5. **Start with daily charts** before exploring other timeframes

### Sensible Approach for Beginners
- Use technical analysis for timing, not stock selection
- Combine with fundamental analysis for better results
- Start with longer timeframes (daily/weekly) to avoid noise
- Paper trade before using real money
- Keep your analysis simple and focused

## Common Technical Analysis Mistakes

1. **Using too many indicators** (indicator overload)
2. **Ignoring the broader trend** while focusing on minor signals
3. **Forcing patterns** to fit your bias
4. **Not respecting stop losses** when signals fail
5. **Overtrading** based on minor signals

Remember: Technical analysis is probabilistic, not deterministic. No pattern or indicator works 100% of the time, and risk management remains essential.

In our next lesson, we'll explore how to build a diversified portfolio using both fundamental and technical insights.
        `,
        order_index: 2,
        duration_minutes: 25,
      },
      {
        id: "",
        module_id: "",
        title: "Reading Financial News Effectively",
        content: `
# Reading Financial News Effectively

Financial news can significantly impact stock prices, but knowing how to interpret this information is crucial. This lesson will help you develop skills to read financial news critically and use it to make better investment decisions.

## Types of Financial News and Their Impact

### Corporate Events
- **Earnings announcements**: Quarterly/annual results compared to expectations
  - Impact: Often causes significant price movements
  - Example: TCS reports 15% profit growth vs. expected 12%

- **Management changes**: CEO/CFO appointments or resignations
  - Impact: Can signal strategic shifts
  - Example: New CEO appointment at Infosys affecting stock price

- **Mergers and acquisitions**: Companies buying or merging with others
  - Impact: Can affect both acquirer and target company
  - Example: HDFC Bank's merger with HDFC Ltd

- **Product launches**: New offerings introduced to market
  - Impact: May indicate growth potential
  - Example: Tata Motors launching new EV models

### Regulatory News
- **Policy changes**: Government regulations affecting industries
  - Impact: Can reshape entire sectors
  - Example: New telecom policy affecting Airtel and Jio

- **Legal developments**: Court rulings, settlements, investigations
  - Impact: May create uncertainty or resolve existing issues
  - Example: Supreme Court ruling on AGR dues for telecom companies

### Economic Indicators
- **GDP growth**: Overall economic health
  - Impact: Affects market sentiment broadly
  - Example: GDP growth dropping below 5%

- **Inflation data**: Consumer or wholesale price indices
  - Impact: Influences interest rate expectations
  - Example: CPI inflation rising above RBI's comfort zone

- **Interest rate decisions**: RBI monetary policy announcements
  - Impact: Affects borrowing costs and valuations
  - Example: RBI raising repo rate by 25 basis points

## News Sources: Quality and Reliability

### Reliable Financial News Sources in India
- **Business newspapers**: Economic Times, Business Standard, Mint
- **Financial websites**: Moneycontrol, LiveMint, Bloomberg Quint
- **Official sources**: Company filings on BSE/NSE, RBI website
- **Business TV channels**: CNBC-TV18, ET Now, Bloomberg

### Evaluating News Source Quality
- **Reputation and track record**: Established sources with journalistic standards
- **Business model**: Subscription models often have less clickbait
- **Attribution**: Clear sourcing of information
- **Correction policy**: Willingness to correct mistakes

### Red Flags in Financial News
- **Sensational headlines** that don't match content
- **Anonymous sources** without specificity
- **Excessive predictions** about precise price movements
- **Conflict of interest** (undisclosed holdings)
- **Urgency** ("Act now!" language)

## How to Read Financial News Critically

### Step 1: Understand the Context
- What's the broader situation this news fits into?
- Is this part of an ongoing story or something new?
- Is this information already priced into the stock?

### Step 2: Separate Facts from Opinion
- Identify concrete data points vs. interpretations
- Look for actual numbers and verifiable information
- Be wary of editorializing disguised as reporting

### Step 3: Consider the Source and Motive
- Why is this news being reported now?
- Who benefits from this information being public?
- Is there a potential agenda behind the timing?

### Step 4: Assess Actual Relevance to Fundamentals
- Will this news impact the company's earnings?
- Does it affect the competitive landscape?
- How long-lasting will the impact be?

### Step 5: Look for Consensus and Dissent
- What are multiple sources saying?
- Are there contrasting viewpoints?
- What are industry experts (not just market commentators) saying?

## Interpreting Different Types of News

### Earnings Reports
- **Look beyond headlines**: "Profits up 10%" could still be a miss if 15% was expected
- **Compare to expectations**: Market reaction often based on performance vs. consensus
- **Check quality of earnings**: One-time gains vs. sustainable growth
- **Listen to guidance**: Future outlook often more important than past results
- **Read management commentary**: What challenges do they highlight?

### Economic Data
- **Compare to previous periods**: Is it improving or deteriorating?
- **Check revisions**: Were previous numbers adjusted?
- **Understand seasonality**: Some metrics fluctuate predictably
- **Look at trends, not single data points**: Direction more important than one reading

### Policy and Regulatory News
- **Consider implementation timeline**: When will changes take effect?
- **Assess adaptation ability**: Which companies can adjust quickly?
- **Look for sector-wide effects**: How are competitors affected?
- **Watch for second-order effects**: Beyond the obvious first impact

## Common Market Reactions to News

### "Buy the rumor, sell the news"
- Prices often move on expectations before official announcements
- Good news that's already anticipated may not move prices further
- Example: Stock rising before earnings, then falling despite good results

### Overreaction and correction
- Markets often initially overreact to surprising news
- Subsequent days may see a more measured response
- Example: Dramatic drop after negative news, followed by partial recovery

### Sector sympathy moves
- News affecting one company often moves related stocks
- May create opportunities if unaffected companies drop
- Example: All banking stocks falling when one bank reports NPAs

## Creating Your News Consumption Strategy

### For Long-Term Investors
- **Focus on**: Quarterly results, annual reports, major corporate developments
- **Limit**: Daily market commentary, short-term predictions
- **Schedule**: Weekly news review rather than constant checking
- **Prioritize**: Industry trends over daily price movements

### For Active Traders
- **Focus on**: Economic releases, breaking news, technical triggers
- **Tools**: News alerts, economic calendars
- **Develop**: "Trading the news" rules to avoid emotional decisions
- **Create**: Pre-market routine to review overnight developments

## Using News in Your Investment Process

### Integration with Analysis
- Use news to update your fundamental thesis
- Question whether news changes your long-term view
- Distinguish between noise and signal

### Creating Information Edges
- Follow specialized industry sources
- Listen to company conference calls
- Read beyond headlines into detailed reports
- Track news that others might miss

### Using News for Contrarian Opportunities
- Extreme negative sentiment can indicate buying opportunities
- Overwhelming positive consensus might signal caution
- Look for disconnects between news reaction and fundamental impact

## Key Takeaways

1. **Quality matters**: Focus on reliable sources with good track records
2. **Context is crucial**: Understand how news fits into bigger picture
3. **Facts over opinions**: Prioritize verifiable information
4. **Relevance test**: Ask how news affects long-term business value
5. **Manage consumption**: Develop a disciplined news routine
6. **Separate signal from noise**: Most financial news is not actionable
7. **Use news as one input**: Never make decisions based solely on news

In our next lesson, we'll explore how to build and manage a diversified stock portfolio.
        `,
        order_index: 3,
        duration_minutes: 20,
      },
    ],
    "Building Your Portfolio": [
      {
        id: "",
        module_id: "",
        title: "Portfolio Construction Basics",
        content: `
# Portfolio Construction Basics

Building an effective investment portfolio is more than just picking good stocks—it's about creating a balanced collection of investments that work together to meet your goals while managing risk. This lesson covers the fundamentals of portfolio construction.

## Portfolio Construction Principles

### 1. Goal-Based Approach
- **Define clear objectives**: Growth, income, capital preservation
- **Set realistic targets**: Expected returns based on asset allocation
- **Establish time horizon**: Short-term (0-3 years), medium-term (3-7 years), long-term (7+ years)
- **Consider liquidity needs**: When might you need to access the money?

### 2. Risk Management Through Diversification
- **Concept**: Not putting all eggs in one basket
- **Benefits**: Reduces impact of any single investment performing poorly
- **Key types of diversification**:
  - Across asset classes (stocks, bonds, gold)
  - Across sectors (banking, IT, consumer)
  - Across market caps (large, mid, small)
  - Across geographies (domestic, international)

### 3. Asset Allocation
- **Definition**: Distribution of investments across different asset classes
- **Importance**: Determines ~90% of portfolio returns variability
- **Factors affecting allocation**:
  - Age and investment horizon
  - Risk tolerance
  - Financial goals
  - Current financial situation

## Building a Stock Portfolio: Step-by-Step

### Step 1: Define Your Investment Parameters
- **Determine amount to invest**: Only use surplus funds after emergency savings
- **Set time horizon**: How long can you stay invested?
- **Establish risk tolerance**: Conservative, moderate, or aggressive
- **Define return expectations**: Realistic targets based on risk level

### Step 2: Create Your Asset Allocation
- **Conservative example** (lower risk):
  - 60% Large-cap stocks/index funds
  - 20% Fixed income
  - 10% Gold
  - 10% Cash
  
- **Moderate example**:
  - 40% Large-cap stocks/index funds
  - 30% Mid-cap stocks
  - 15% Fixed income
  - 10% Gold
  - 5% Cash
  
- **Aggressive example** (higher risk):
  - 40% Mid-cap stocks
  - 30% Large-cap stocks
  - 20% Small-cap stocks
  - 5% International stocks
  - 5% Cash

### Step 3: Sector Allocation
- **Defensive sectors**: FMCG, pharmaceuticals, utilities
- **Cyclical sectors**: Banking, auto, real estate
- **Growth sectors**: IT, e-commerce, renewable energy
- **Balanced approach**: Exposure to 5-7 sectors with no single sector >25%

### Step 4: Stock Selection Within Sectors
- **Quality parameters**:
  - Consistently profitable
  - Low debt levels
  - Good return on equity (15%+)
  - Competitive advantages
  - Capable management

- **Valuation considerations**:
  - Reasonable P/E relative to growth
  - P/E compared to sector average
  - Price-to-book value
  - Dividend yield (if income is a goal)

### Step 5: Position Sizing
- **General guideline**: No single stock >5-10% of portfolio
- **Conviction-based adjustment**: Higher allocation to highest conviction ideas
- **Risk-based sizing**: Lower allocation to higher-risk stocks
- **Practical example**:
  - Core positions (stronger companies): 5-7% each
  - Satellite positions (growth opportunities): 2-4% each

### Step 6: Entry Strategy
- **For lump sum investing**:
  - Staggered entry over 3-6 months
  - Buy in 2-3 tranches to average out entry price
  
- **For regular investing**:
  - Set up SIPs for mutual funds/index funds
  - Regular monthly purchases of stocks

## Portfolio Models for Different Investors

### Beginner Portfolio (0-2 years experience)
- **Structure**: 
  - 70-80% Index funds (Nifty 50, Nifty Next 50)
  - 20-30% Large-cap blue-chip stocks (5-7 stocks)
- **Advantage**: Simplicity, lower risk, less monitoring
- **Example allocation**:
  - Nifty 50 index fund: 50%
  - Nifty Next 50 index fund: 30%
  - 4 blue-chip stocks: 5% each

### Intermediate Portfolio (2-5 years experience)
- **Structure**:
  - 40-50% Index funds
  - 30-40% Direct stocks (10-15 companies)
  - 10-20% Thematic opportunities
- **Advantage**: Balance of simplicity and potential outperformance
- **Example sectors**: Banking, IT, FMCG, Pharma, Auto

### Advanced Portfolio (5+ years experience)
- **Structure**:
  - 60-70% Direct stocks (15-20 companies)
  - 20-30% Strategic sector allocations
  - 10% High-potential opportunities
- **Advantage**: Customization and potential for higher returns
- **Requires**: More time, knowledge, and monitoring

## Portfolio Monitoring and Rebalancing

### Regular Review Process
- **Quarterly**: Review performance vs. benchmarks
- **Semi-annually**: Detailed fundamental review of holdings
- **Annually**: Major rebalancing if needed

### When to Rebalance
- **Time-based**: Fixed schedule (e.g., annually)
- **Threshold-based**: When allocations drift beyond set limits (e.g., ±5%)
- **Combination approach**: Regular review with threshold triggers

### What to Monitor
- **Company fundamentals**: Earnings growth, ROE, debt levels
- **Valuation metrics**: P/E ratio, P/B ratio
- **Sector developments**: Regulatory changes, competitive landscape
- **Portfolio concentration**: Ensuring diversification is maintained

## Common Portfolio Construction Mistakes

### 1. Overdiversification
- **Problem**: Too many stocks dilute returns and attention
- **Solution**: Quality over quantity; 15-20 stocks maximum for most investors
- **Warning sign**: You can't remember what you own and why

### 2. Emotional Allocation
- **Problem**: Building portfolio based on recent performance or news
- **Solution**: Systematic approach based on fundamentals and valuation
- **Warning sign**: Frequent buying of "hot stocks" or sectors

### 3. Ignoring Correlation
- **Problem**: Owning many stocks that move similarly
- **Solution**: Check how holdings have performed in different market conditions
- **Warning sign**: Portfolio moves dramatically up or down as a whole

### 4. Neglecting Portfolio Drift
- **Problem**: Original allocation changes as some investments grow faster
- **Solution**: Regular rebalancing to maintain target allocation
- **Warning sign**: One position becomes >15% of portfolio

### 5. Lack of Documentation
- **Problem**: No record of why investments were made
- **Solution**: Investment journal noting thesis for each position
- **Warning sign**: Unable to articulate why you own something

## Creating Your Investment Policy Statement

An Investment Policy Statement (IPS) is a written document that outlines your:

1. **Investment goals and objectives**
2. **Time horizon for different goals**
3. **Risk tolerance and constraints**
4. **Target asset allocation**
5. **Selection criteria for investments**
6. **Rebalancing strategy and triggers**
7. **Performance evaluation benchmarks**

Having this document helps maintain discipline and consistency in your approach.

## Key Takeaways

1. **Start with allocation, not stock picking**: The broad structure matters more than individual selections
2. **Match portfolio to your situation**: No perfect portfolio exists—only one that's right for you
3. **Build gradually**: Start simple and add complexity as your knowledge grows
4. **Diversify purposefully**: Each holding should serve a specific role
5. **Document your strategy**: Write down your plan and reasons for each investment
6. **Review regularly but trade infrequently**: Most good investments need time to work

Our next lesson will cover portfolio monitoring and management techniques to help you maintain your investment strategy over time.
        `,
        order_index: 1,
        duration_minutes: 25,
      },
      {
        id: "",
        module_id: "",
        title: "Tax Planning for Investors",
        content: `
# Tax Planning for Investors

Understanding the tax implications of your investments is crucial for maximizing returns. This lesson covers the fundamentals of tax planning for stock market investors in India.

## Types of Investment-Related Taxes

### Capital Gains Tax
- **Definition**: Tax on profits made from selling investments
- **Types**:
  - Short-term capital gains (STCG): Assets held for ≤ 1 year
  - Long-term capital gains (LTCG): Assets held for > 1 year

### Dividend Tax
- **Definition**: Tax on dividends received from investments
- **Current status**: Taxed in the hands of the investor at their applicable income tax slab rate

### Securities Transaction Tax (STT)
- **Definition**: Tax collected at source on purchase or sale of securities
- **Application**: Automatically deducted during transactions on recognized exchanges

## Capital Gains Tax Rates (Current as of 2023)

### Equity Shares and Equity Mutual Funds

#### Short-Term Capital Gains (≤ 1 year)
- **Tax rate**: 15% (plus applicable surcharge and cess)
- **Example**: 
  - Buy: 100 shares @ ₹500 = ₹50,000
  - Sell after 8 months: 100 shares @ ₹600 = ₹60,000
  - STCG: ₹10,000
  - Tax: ₹10,000 × 15% = ₹1,500 (plus surcharge and cess if applicable)

#### Long-Term Capital Gains (> 1 year)
- **Tax rate**: 10% on gains exceeding ₹1 lakh per financial year (without indexation benefit)
- **Example**:
  - Buy: 100 shares @ ₹400 = ₹40,000
  - Sell after 2 years: 100 shares @ ₹650 = ₹65,000
  - LTCG: ₹25,000
  - Exempt amount: ₹1,00,000 per year
  - Taxable amount: Nil (as gains are below exemption threshold)

### Debt Mutual Funds and Bonds

#### Short-Term Capital Gains (≤ 3 years)
- **Tax rate**: Added to income and taxed as per income tax slab

#### Long-Term Capital Gains (> 3 years)
- **Tax rate**: 20% with indexation benefit
- **Indexation**: Adjusts purchase price for inflation, reducing the taxable gain

## Tax-Efficient Investment Strategies

### 1. Hold for Long Term
- **Strategy**: Maintain equity investments for >1 year
- **Benefit**: Lower tax rate (10% vs 15%) plus ₹1 lakh exemption
- **Example**: Selling shares worth ₹10 lakhs with 20% gain:
  - If sold before 1 year: Tax = ₹30,000 (₹2 lakh gain × 15%)
  - If sold after 1 year: Tax = ₹10,000 (₹2 lakh gain - ₹1 lakh exemption) × 10%

### 2. Harvest Tax Losses
- **Strategy**: Offset gains by realizing losses before financial year-end
- **Process**:
  - Identify investments trading below purchase price
  - Sell to book losses
  - Repurchase after 3 days (to avoid wash sale implications)
- **Benefit**: Reduces taxable gains for the year
- **Example**: 
  - You have LTCG of ₹2 lakhs in Stock A
  - Stock B is showing a loss of ₹50,000
  - Sell Stock B to realize loss
  - Net taxable LTCG: ₹1.5 lakhs (₹2 lakhs - ₹50,000)

### 3. Plan Redemptions Across Financial Years
- **Strategy**: Spread large redemptions across financial years
- **Benefit**: Utilize the ₹1 lakh LTCG exemption each year
- **Example**:
  - Instead of selling shares with ₹3 lakhs gain in March
  - Sell half in March and half in April (new financial year)
  - Utilize exemption twice (₹1 lakh each year)

### 4. Use Tax-Efficient Investment Vehicles
- **Strategy**: Invest through vehicles with favorable tax treatment
- **Options**:
  - Equity-Linked Savings Scheme (ELSS): Tax deduction under 80C and favorable LTCG treatment
  - National Pension System (NPS): Deductions under 80C and 80CCD with partially tax-free withdrawals
  - Unit-Linked Insurance Plans (ULIPs): Tax-free returns if conditions met

### 5. Optimize Dividend vs. Growth Options
- **Strategy**: Choose growth option for compounding during wealth-building phase
- **Rationale**: Dividends taxed at income tax slab rate (potentially 30%+), while long-term capital gains taxed at 10%
- **Exception**: Retirees needing regular income might prefer dividend option despite tax inefficiency

## Securities Transaction Tax (STT) Awareness

### Current STT Rates (as of 2023)
- **Equity delivery-based buying**: 0.1% of transaction value
- **Equity delivery-based selling**: 0.1% of transaction value
- **Equity intraday/F&O**: 0.025% of transaction value
- **Futures**: 0.01% of transaction value
- **Options premium**: 0.05% of premium value
- **Options exercise**: 0.125% of settlement price

### Impact on Trading Strategies
- **Higher impact on frequent traders**: Consider STT in break-even calculations
- **Lower impact on long-term investors**: Minimal effect when amortized over holding period

## Tax Compliance for Investors

### Reporting Investment Income
- **ITR forms**: Different forms based on income sources
  - ITR-1: Not applicable if you have capital gains
  - ITR-2: For individuals with capital gains
  - ITR-3: For individuals with business income plus investments

### Documents to Maintain
- **Contract notes**: For all buy/sell transactions
- **Account statements**: Demat and trading account statements
- **Form 26AS**: Tax credit statement showing TDS
- **Capital gains statement**: From broker or self-prepared

### Common Compliance Pitfalls
- **Under-reporting dividends**: All dividends must be reported
- **Missing penny stocks gains**: Even small transactions count
- **Incorrect holding period calculation**: Verify dates carefully
- **Not reporting foreign investments**: Mandatory disclosure requirements

## Special Tax Situations

### Inherited or Gifted Shares
- **Cost basis**: Original purchase price of previous owner
- **Holding period**: Includes previous owner's holding period
- **Documentation**: Maintain proof of inheritance/gift

### Corporate Actions
- **Stock splits/bonuses**: Cost basis is adjusted proportionately
- **Mergers/demergers**: Special rules for calculating cost basis
- **Buybacks**: Taxed as capital gains, not dividends

### Foreign Investments
- **US stocks/ETFs**: Subject to both Indian and potential US tax implications
- **Reporting requirement**: Schedule FA for foreign assets
- **DTAA benefits**: Check Double Taxation Avoidance Agreements

## Tax Planning Calendar

### Quarterly
- **Review unrealized gains/losses**: Identify tax-loss harvesting opportunities
- **Estimate advance tax liability**: For large expected capital gains

### December-January
- **Tax-loss harvesting**: Realize losses to offset gains before year-end
- **ELSS investments**: Complete Section 80C investments

### February-March
- **Plan redemptions**: Decide whether to sell before or after March 31
- **Finalize tax-saving investments**: Complete any remaining tax-saving investments

### July
- **File tax returns**: Submit ITR with complete investment details
- **Verify Form 26AS**: Ensure all TDS is correctly reflected

## Key Takeaways

1. **Tax planning is legitimate**: It's different from tax evasion and should be part of your investment strategy
2. **Holding period matters**: Significant tax advantages for long-term investments
3. **Documentation is crucial**: Maintain proper records of all transactions
4. **Stay updated**: Tax laws change; review strategies annually
5. **Consider after-tax returns**: Focus on what you keep, not just what you earn
6. **Seek professional advice**: Consult a tax professional for complex situations

Remember that while tax efficiency is important, investment decisions should primarily be based on fundamentals and your financial goals—tax benefits should be secondary.

Our next lesson will cover the practical aspects of monitoring your portfolio and making adjustments as needed.
        `,
        order_index: 2,
        duration_minutes: 20,
      },
      {
        id: "",
        module_id: "",
        title: "Managing Emotions in Investing",
        content: `
# Managing Emotions in Investing

Emotional decision-making is one of the biggest obstacles to investment success. This lesson explores how emotions affect investment decisions and provides practical strategies to manage them effectively.

## How Emotions Impact Investment Decisions

### Common Emotional Biases

#### Fear
- **Manifestation**: Selling during market downturns, avoiding good investment opportunities
- **Market impact**: Exiting positions at lows, missing recovery
- **Example**: Panic selling during March 2020 COVID crash, missing the subsequent rally

#### Greed
- **Manifestation**: Chasing performance, buying at market peaks
- **Market impact**: Buying high, increasing risk exposure at wrong time
- **Example**: Piling into IT stocks at peak valuations during 2021

#### Overconfidence
- **Manifestation**: Excessive trading, concentrated positions, ignoring risks
- **Market impact**: Increased costs, under-diversification, unexpected losses
- **Example**: Taking oversized positions in "sure thing" stocks

#### Confirmation Bias
- **Manifestation**: Seeking information that supports existing views
- **Market impact**: Ignoring warning signs, failing to reassess thesis
- **Example**: Only reading positive news about stocks you own

#### Recency Bias
- **Manifestation**: Giving too much weight to recent events
- **Market impact**: Extrapolating short-term trends too far
- **Example**: Assuming a three-month rally will continue indefinitely

#### Loss Aversion
- **Manifestation**: Feeling losses more strongly than equivalent gains
- **Market impact**: Holding losing positions too long, selling winners too soon
- **Example**: Refusing to sell a stock that's down 30% to avoid "locking in" the loss

## The Behavior Gap: Emotions vs. Returns

### What Research Shows
- **Investor returns vs. investment returns**: Studies consistently show average investors underperform their own investments
- **Behavior gap**: Difference between investment performance and investor performance due to timing decisions
- **Quantified impact**: DALBAR studies show 3-5% annual underperformance due to behavioral mistakes

### Why It Happens
- **Market timing mistakes**: Buying high (when confident) and selling low (when scared)
- **Performance chasing**: Investing in what's recently performed well
- **Inconsistent strategy**: Switching approaches based on recent results
- **Overreaction**: Responding too strongly to both positive and negative news

## Creating an Emotional Management System

### 1. Develop an Investment Policy Statement (IPS)
- **What it is**: Written document outlining investment strategy, criteria, and processes
- **Key components**:
  - Investment goals and time horizon
  - Risk tolerance assessment
  - Asset allocation targets
  - Criteria for buying and selling
  - Rebalancing schedule
- **How it helps**: Provides objective reference point during emotional periods

### 2. Implement Rules-Based Decision Making
- **Entry rules**: Specific criteria that must be met before buying
  - Example: "Only buy stocks with P/E below sector average, 5-year revenue growth >10%, and debt-to-equity <0.5"
  
- **Exit rules**: Predetermined conditions for selling
  - Example: "Sell if fundamentals deteriorate (ROE drops below 12% for 2 consecutive quarters) or valuation exceeds threshold (P/E > 40)"
  
- **Allocation rules**: Guidelines for position sizing
  - Example: "No single stock >5% of portfolio; gradually add to positions in 3 tranches"

### 3. Automate Where Possible
- **Systematic investment plans** (SIPs): Regular, fixed-amount investments
- **Automatic rebalancing**: Schedule regular portfolio adjustments
- **Alerts instead of constant checking**: Set price or news alerts rather than watching continuously

### 4. Develop Self-Awareness Practices
- **Investment journal**: Record decisions, rationale, and emotional state
  - Example entry: "Bought Company X today because [reasons]. Feeling [emotion] about the market currently."
  
- **Pre-mortems**: Imagine investment has failed and identify potential causes
  - Example: "If this investment loses 30%, what would likely have gone wrong?"
  
- **Emotional check-in**: Before making decisions, assess your current emotional state
  - Ask: "Am I making this decision out of fear, greed, or rational analysis?"

## Strategies for Specific Market Conditions

### During Bull Markets
- **Combat overconfidence and greed**:
  - Regularly rebalance to target allocation
  - Maintain selling discipline when valuations get stretched
  - Keep cash reserve for opportunities
  - Remember that trees don't grow to the sky

- **Reality check questions**:
  - "Would I buy this at current prices if I didn't already own it?"
  - "What could go wrong with the bullish thesis?"
  - "Am I increasing risk because everyone else seems to be making easy money?"

### During Bear Markets
- **Combat fear and pessimism**:
  - Review your original investment thesis
  - Focus on fundamentals, not prices
  - Implement predetermined buying plans
  - Limit consumption of alarming financial news

- **Reality check questions**:
  - "Has the long-term outlook for this company fundamentally changed?"
  - "Am I selling because of price action or deteriorating fundamentals?"
  - "What's the historical context for this decline?"

### During Sideways/Volatile Markets
- **Combat impatience and overtrading**:
  - Focus on long-term goals rather than short-term performance
  - Use dollar-cost averaging to reduce timing pressure
  - Find productive activities besides watching portfolio

- **Reality check questions**:
  - "Is this new strategy truly better, or am I just bored?"
  - "What's the cost (taxes, fees) of making changes now?"
  - "Am I confusing activity with progress?"

## Practical Techniques for Emotional Management

### Media and Information Diet
- **Limit consumption**: Reduce financial news watching during volatile periods
- **Quality over quantity**: Focus on fundamental analysis rather than price predictions
- **Designated times**: Schedule specific times for market updates rather than constant checking

### Support Systems
- **Investment buddy**: Trusted friend to discuss decisions and provide perspective
- **Professional advisor**: Objective third-party for major decisions
- **Investment communities**: Groups following similar discipline-focused strategies

### Cognitive Restructuring
- **Reframing market declines**: View them as sales or opportunities rather than losses
- **Separating price from value**: Remind yourself that price volatility doesn't equal change in intrinsic value
- **Extending time horizon**: Consider 5-10 year outlook instead of next week or month

### Stress Management Techniques
- **Breathing exercises**: Simple 4-7-8 breathing when feeling market anxiety
- **Physical activity**: Exercise before making important investment decisions
- **Sleeping on it**: 24-hour rule for significant portfolio changes

## Learning from Behavioral Mistakes

### Post-Decision Assessment
- **Regular review**: Quarterly review of all buying/selling decisions
- **Outcome vs. process**: Evaluate the decision process, not just the result
- **Improvement focus**: Identify patterns and create safeguards

### Questions for Review
1. Was this decision made based on my predetermined strategy?
2. What emotions influenced this decision?
3. What information did I have, and what did I miss?
4. Would I make the same decision again given the same circumstances?
5. How can I improve my decision process next time?

## Key Takeaways

1. **Emotions are natural**: Everyone experiences them; success comes from managing, not eliminating them
2. **Systems beat willpower**: Create processes that work when emotions are strong
3. **Preparation is key**: Decide how you'll act in different scenarios before they happen
4. **Self-awareness matters**: Recognizing emotional states is the first step to managing them
5. **Process over outcomes**: Focus on making good decisions, not perfect predictions
6. **Consistency beats timing**: Disciplined approach outperforms emotional reactions
7. **Progress, not perfection**: Emotional management is a skill developed over time

In our final lesson, we'll explore advanced concepts and bringing together everything you've learned into a cohesive investment approach.
        `,
        order_index: 3,
        duration_minutes: 20,
      },
    ],
  };

  // Create the course with its modules and lessons
  await createCourse(course, modules, lessonsData);
};

/**
 * Initialize data for the app
 * This creates courses, modules, and lessons if they don't exist yet
 */
export const initializeAppData = async (): Promise<void> => {
  try {
    console.log("Starting app data initialization");
    
    // Create the AI Tools course
    await createAIToolsCourse();
    
    // Create the Stock Market course
    await createStockMarketCourse();
    
    console.log("App data initialization complete");
  } catch (error) {
    console.error("Error in initializeAppData:", error);
  }
};
