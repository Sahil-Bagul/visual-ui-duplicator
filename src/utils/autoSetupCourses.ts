
import { supabase } from "@/integrations/supabase/client";

type LessonData = {
  title: string;
  content: string;
  lesson_order: number;
};

type ModuleData = {
  title: string;
  description: string;
  module_order: number;
  lessons: LessonData[];
};

type CourseData = {
  title: string;
  price: number;
  referral_reward: number;
  description: string;
  modules: ModuleData[];
};

// Check if a course with the given title already exists
const courseExists = async (title: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("title", title)
    .single();
  
  if (error && error.code !== "PGRST116") {
    console.error("Error checking if course exists:", error);
    return false;
  }
  
  return !!data;
};

// Check if any courses exist in the database
const anyCourseExists = async (): Promise<boolean> => {
  const { count, error } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });
  
  if (error) {
    console.error("Error checking if any courses exist:", error);
    return false;
  }
  
  return count !== null && count > 0;
};

// Create a course with modules and lessons
const createCourse = async (course: CourseData): Promise<string | null> => {
  try {
    // 1. Create the course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        price: course.price,
        referral_reward: course.referral_reward,
        description: course.description
      })
      .select()
      .single();
    
    if (courseError) {
      console.error("Error creating course:", courseError);
      return null;
    }
    
    const courseId = courseData.id;
    console.log(`Created course: ${course.title} with ID: ${courseId}`);
    
    // 2. Create modules for the course
    for (const module of course.modules) {
      const { data: moduleData, error: moduleError } = await supabase
        .from("course_modules")
        .insert({
          course_id: courseId,
          title: module.title,
          description: module.description,
          module_order: module.module_order,
          content: module.description // Using description as content as well
        })
        .select()
        .single();
      
      if (moduleError) {
        console.error(`Error creating module ${module.title}:`, moduleError);
        continue;
      }
      
      const moduleId = moduleData.id;
      console.log(`Created module: ${module.title} with ID: ${moduleId}`);
      
      // 3. Create lessons for the module
      for (const lesson of module.lessons) {
        const { error: lessonError } = await supabase
          .from("lessons")
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: lesson.content,
            lesson_order: lesson.lesson_order
          });
        
        if (lessonError) {
          console.error(`Error creating lesson ${lesson.title}:`, lessonError);
        } else {
          console.log(`Created lesson: ${lesson.title}`);
        }
      }
    }
    
    return courseId;
  } catch (err) {
    console.error("Error in createCourse:", err);
    return null;
  }
};

// Main function to initialize app data
export const initializeAppData = async (): Promise<void> => {
  try {
    // Check if courses already exist
    const coursesExist = await anyCourseExists();
    
    if (coursesExist) {
      console.log("Courses already exist, skipping initialization");
      return;
    }
    
    console.log("No courses found, initializing app data...");
    
    // Create AI Tools course
    const aiToolsCourse: CourseData = {
      title: "AI Tools for Students",
      price: 500,
      referral_reward: 250,
      description: "Learn how to use AI tools to boost your productivity and creativity as a student.",
      modules: [
        {
          title: "Introduction to AI Tools",
          description: "Learn the basics of AI tools and why they are important for students.",
          module_order: 1,
          lessons: [
            {
              title: "What are AI Tools?",
              content: `# What are AI Tools?

📱 **AI tools** are computer programs that use artificial intelligence to help you complete tasks faster and better.

## How AI Tools Work

AI tools work by:

1. **Learning patterns** from huge amounts of data
2. **Making predictions** or decisions based on what they've learned
3. **Automating tasks** that would take humans much longer to do

## Examples of AI Tools for Students

- **ChatGPT**: Helps with writing, answering questions, and explaining concepts
- **Notion AI**: Makes note-taking and organizing information easier
- **Grammarly**: Checks your writing for mistakes and suggests improvements
- **Canva AI**: Helps design presentations and graphics quickly

## Why AI Tools Matter

AI tools are like having a personal assistant that can help with your studies 24/7. They can:

- Save you time on repetitive tasks
- Help you understand difficult concepts
- Improve the quality of your work
- Let you focus on the more important parts of learning

💡 **Important**: AI tools are helpers, not replacements for your own thinking! They work best when you use your own knowledge and creativity along with them.`,
              lesson_order: 1
            },
            {
              title: "Why AI is Important for Students",
              content: `# Why AI is Important for Students

🎓 As a student in today's world, understanding and using AI tools gives you a significant advantage.

## The Changing Educational Landscape

The way we learn is changing rapidly because of technology:

- **Information overload**: There's more content to learn than ever before
- **Skill requirements**: Jobs now demand both traditional and digital skills
- **Competitive environment**: Standing out requires more than just good grades

## Benefits of AI for Students

### 1. Personalized Learning
- AI can adapt to your learning pace and style
- Get explanations tailored to your level of understanding
- Practice exactly what you need to improve on

### 2. Time Management
- Automate routine tasks (summarizing, organizing notes)
- Focus your time on deeper learning and creative thinking
- Complete assignments more efficiently

### 3. Access to Resources
- Get instant answers to questions at any time
- Access explanations even when teachers aren't available
- Find learning materials suited to your specific needs

### 4. Future-Proofing Your Career
- Most future jobs will require AI literacy
- Early exposure gives you a head start
- Understanding AI helps you adapt to changing job markets

## Real-Life Student Success Stories

> "I used ChatGPT to help brainstorm my project ideas and improved my grades from B to A"
> 
> "AI tools helped me manage my time better during exams by organizing my study schedule"
> 
> "I learned how to prompt AI effectively and now I can get much better results for my research papers"

⚠️ **Remember**: AI tools should support your learning, not replace it. Critical thinking remains essential!`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "AI for Productivity",
          description: "Discover how AI can help you with research, note-taking, and writing.",
          module_order: 2,
          lessons: [
            {
              title: "Using ChatGPT for Research & Learning",
              content: `# Using ChatGPT for Research & Learning

🔍 ChatGPT can transform how you research topics and learn new concepts.

## What is ChatGPT?

ChatGPT is an AI assistant created by OpenAI that can:
- Have conversations on almost any topic
- Explain complex concepts in simple terms
- Help you brainstorm and develop ideas
- Create summaries and outlines

## Effective Research Techniques with ChatGPT

### 1. Ask Clear, Specific Questions
**Less effective**: "Tell me about photosynthesis"
**More effective**: "Explain the light-dependent reactions of photosynthesis in simple terms"

### 2. Use the Socratic Method
Ask a series of follow-up questions to dig deeper:
1. Start with a broad question
2. Ask for clarification on specific points
3. Request examples or analogies
4. Challenge the explanation to test understanding

### 3. Request Different Perspectives
- "Can you explain this topic from another viewpoint?"
- "What are some criticisms of this theory?"
- "How would different experts approach this problem?"

## Study Strategies with ChatGPT

### 1. Create Custom Study Guides
```
Create a study guide for [topic] covering:
- Key concepts
- Important formulas
- Common misconceptions
- Practice questions with solutions
```

### 2. Test Your Understanding
- Ask ChatGPT to quiz you on a topic
- Request explanations for why your answers are right or wrong
- Have it create practice problems at different difficulty levels

### 3. Simplify Complex Material
- Ask for explanations "as if I'm 10 years old"
- Request metaphors or analogies to understand difficult concepts
- Break down complicated processes step by step

## Important Limitations

⚠️ **Always verify information** from ChatGPT with reliable sources
⚠️ ChatGPT may occasionally provide incorrect information
⚠️ It has limited knowledge of events after its training cutoff date

💡 **Pro Tip**: Keep a log of your best prompts for different types of academic tasks!`,
              lesson_order: 1
            },
            {
              title: "Using Notion AI for Note-taking & Planning",
              content: `# Using Notion AI for Note-taking & Planning

📝 Notion AI combines the power of a versatile note-taking app with AI assistance to transform how you organize your studies.

## What is Notion AI?

Notion is a productivity tool that lets you create:
- Notes and documents
- Databases and tables
- To-do lists and task trackers
- Wikis and knowledge bases

Notion AI adds artificial intelligence capabilities directly into this system.

## Setting Up Your Notion Student System

### 1. Create a Dashboard
Start with a simple dashboard containing:
- Current classes/subjects
- Upcoming assignments
- Weekly schedule
- Goals tracker

### 2. Build Subject Databases
For each subject, create a database with:
- Lecture notes
- Reading notes
- Assignments
- Resources
- Practice problems

## Using Notion AI for Better Notes

### 1. Summarizing Content
After taking detailed notes in class:
- Highlight the section
- Use "/AI Summarize" command
- Review and edit the summary
- Create bullet-point key takeaways

### 2. Expanding on Ideas
When you have a basic concept but need more detail:
- Write down the core idea
- Use "/AI Help me finish writing this"
- Specify the tone and depth you want

### 3. Creating Study Materials
- Transform lecture notes into flashcards
- Generate practice questions
- Create concept maps by asking AI to identify connections

## Planning and Task Management

### 1. Smart To-Do Lists
Use Notion AI to:
- Break down large assignments into manageable steps
- Suggest realistic timeframes for tasks
- Prioritize your work based on deadlines and importance

### 2. Time Blocking Templates
- Create time block templates for different types of days
- Ask AI to suggest optimal study schedules
- Generate daily routines that balance work and breaks

### 3. Progress Tracking
- Build habit trackers for consistent study
- Create reflection templates for weekly review
- Use AI to analyze your productivity patterns

## Tips for Notion AI Success

💡 **Consistency is key**: Update your system regularly
💡 **Start simple**: Begin with basic templates and expand
💡 **Personalize**: Adapt examples to your specific needs
💡 **Regularly review**: Refine your system as you learn what works

⚠️ **Remember**: The best system is one you'll actually use!`,
              lesson_order: 2
            },
            {
              title: "Grammarly & Quillbot for Writing Help",
              content: `# Grammarly & Quillbot for Writing Help

✏️ These AI writing assistants can significantly improve your academic writing quality and efficiency.

## Grammarly: Your Writing Coach

### What Grammarly Does
Grammarly is an AI-powered writing assistant that helps with:
- Grammar and spelling corrections
- Punctuation and sentence structure
- Tone adjustments
- Clarity and conciseness
- Plagiarism detection (Premium)

### How to Use Grammarly Effectively

#### 1. Set Up Your Goals
Before checking a document, configure:
- Audience (professors, peers, general)
- Formality level
- Domain (academic, general)
- Intent (inform, describe, convince)

#### 2. Beyond Basic Corrections
Look for:
- **Clarity suggestions**: Making your writing more understandable
- **Engagement tips**: Avoiding repetitive or dull language
- **Delivery adjustments**: Ensuring appropriate tone
- **Full-sentence rewrites**: Alternative ways to express ideas

#### 3. Grammarly for Different Assignment Types
- **Essays**: Focus on clarity, coherence, and academic tone
- **Research papers**: Check for formal language and precise vocabulary
- **Emails to professors**: Ensure professional but friendly tone
- **Creative writing**: Balance correctness with stylistic choices

## Quillbot: Paraphrasing and Rewriting

### What Quillbot Does
Quillbot specializes in:
- Paraphrasing text while preserving meaning
- Offering multiple rewriting styles
- Summarizing long content
- Simplifying complex text
- Expanding brief notes into full sentences

### Using Quillbot Wisely

#### 1. Paraphrasing Modes
Choose the right mode for your needs:
- **Standard**: Balanced changes while preserving meaning
- **Fluency**: Focuses on natural-sounding language
- **Formal**: Academic and professional language
- **Simple**: Makes complex content easier to understand
- **Creative**: More extensive rewrites (use cautiously)

#### 2. Smart Research Techniques
- Paste complex explanations to get simplified versions
- Rewrite to ensure you truly understand the content
- Compare original text with paraphrased version to check meaning preservation

#### 3. Avoiding Plagiarism
- Use Quillbot to understand concepts in your own words
- Always cite sources when paraphrasing ideas from others
- Don't rely solely on AI—add your own analysis and thoughts

## Best Practices for Both Tools

### Do:
✅ Review all AI suggestions before accepting
✅ Learn from corrections to improve your writing
✅ Use them as learning tools, not just quick fixes
✅ Maintain your unique voice and ideas

### Don't:
❌ Accept all suggestions without thinking
❌ Use them to write entire assignments for you
❌ Forget to proofread the final result yourself

💡 **Pro Tip**: Use Grammarly first for corrections, then Quillbot for paraphrasing if needed, then Grammarly again to check the final result.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "AI for Creativity",
          description: "Learn how to use AI tools for design, images, video, and music creation.",
          module_order: 3,
          lessons: [
            {
              title: "Using Canva AI for Design",
              content: `# Using Canva AI for Design

🎨 Canva AI transforms how students create visual content—making professional-quality design accessible to everyone.

## What is Canva AI?

Canva is a graphic design platform that now includes powerful AI features:
- Text-to-image generation
- Magic Design (instant layouts)
- Magic Write (text generation)
- Magic Edit (image manipulation)
- Background remover
- Style applicator

## Getting Started with Canva AI

### 1. Setting Up Your Account
- Sign up for a free account (student email may give you premium features)
- Explore the dashboard and templates
- Enable the "Magic" features in your account settings

### 2. Understanding the Canvas
- Templates vs. blank designs
- Element library
- Text and font options
- Upload section for your own images

## Essential Canva AI Features for Students

### 1. Magic Design
Perfect for creating quick, professional presentations:
1. Enter your topic
2. Select the type of design (presentation, poster, social media)
3. Choose a style that matches your project
4. Customize colors and imagery to your preference

### 2. Magic Write
Helps generate text content for your designs:
- Product descriptions
- Headlines and titles
- Brief explanations
- Bulleted lists

### 3. Text to Image
Create custom images for your projects:
- Describe what you want ("A 3D render of quantum computing principles")
- Specify style ("in a minimalist style with blue and purple colors")
- Generate multiple options
- Fine-tune with additional prompts

## Project Examples with Canva AI

### Academic Presentations
1. Choose a presentation template
2. Use Magic Write to generate outline points
3. Use Text to Image for conceptual illustrations
4. Apply consistent styling with Brand Kit

### Study Materials
1. Create flashcard templates
2. Generate concept diagrams with Text to Image
3. Use Magic Design for visual summaries
4. Export as PDFs for printing or sharing

### Project Posters
1. Start with a poster template
2. Generate a striking main image with Text to Image
3. Use Magic Write for concise descriptions
4. Export in high resolution for printing

## Tips for Better Canva AI Results

### For Text Generation:
- Be specific about tone and purpose
- Edit generated text to add your personal insights
- Use as starting points, not final content

### For Image Creation:
- Use detailed descriptions including style, colors, and mood
- Try variations of the same prompt
- Combine AI-generated elements with stock photos for unique results

### For Presentations:
- Maintain consistent visual language
- Focus on one key point per slide
- Use AI to create visual metaphors for complex concepts

💡 **Pro Tip**: Save your best AI-generated designs as templates for future projects!`,
              lesson_order: 1
            },
            {
              title: "Using Leonardo AI for Images",
              content: `# Using Leonardo AI for Images

🖼️ Leonardo AI is a powerful tool that lets students create professional-quality images from text descriptions—no artistic skills required.

## What is Leonardo AI?

Leonardo AI is a text-to-image generation platform that:
- Creates detailed images from written descriptions
- Offers various artistic styles and models
- Allows image modifications and variations
- Provides resolution upscaling
- Enables inpainting and outpainting features

## Getting Started with Leonardo AI

### 1. Creating Your Account
- Sign up for a free account (you get limited free generations)
- Explore the gallery for inspiration
- Familiarize yourself with the generation interface

### 2. Understanding Prompt Engineering
The quality of your image depends on your prompt:
- Be specific about what you want to see
- Include details about style, lighting, and composition
- Use artistic references when helpful

## Key Features for Student Projects

### 1. Text to Image Generation
Perfect for creating:
- Illustrations for presentations
- Visual metaphors for complex concepts
- Custom imagery for assignments
- Graphics for research posters

**Basic Prompt Format:**
```
[Subject] in the style of [art style], [additional details], [lighting], [composition]
```

**Example:**
```
A detailed cross-section of a plant cell, digital illustration, educational style, soft lighting, blue background, labeled parts, high detail
```

### 2. Image Variations
When you have an image that's close but not perfect:
1. Upload or select your starting image
2. Choose the variation strength (how different it will be)
3. Adjust the prompt to focus on what you want to change
4. Generate multiple variations

### 3. Resolution Enhancement
For presentation-quality images:
1. Generate your base image
2. Use the upscaling feature
3. Apply enhancement filters if needed

## Project Applications for Students

### 1. Science and Medicine
- Anatomical illustrations
- Visualizations of scientific processes
- Microorganism illustrations
- Chemical reaction demonstrations

### 2. History and Social Studies
- Historical scene recreations
- Cultural artifact visualizations
- Map overlays and geographical features
- Timeline event illustrations

### 3. Literature and Arts
- Book scene visualizations
- Character portraits
- Setting illustrations
- Conceptual representations of themes

### 4. Business and Economics
- Process flow visualizations
- Data representation concepts
- Marketing material mockups
- Brand concept illustrations

## Advanced Techniques

### 1. Negative Prompting
Specify what you DON'T want in the image:
```
A neuron network diagram, scientific illustration
Negative prompt: blurry, text, watermarks, low quality, distorted
```

### 2. Style Mixing
Combine different artistic influences:
```
A sustainable city of the future, combining architectural blueprints with watercolor painting style, detailed, top-down view
```

### 3. Reference Images
Use the "image to image" feature to guide generation based on a reference.

## Ethical Considerations

⚠️ **Important guidelines:**
- Don't create or pass off AI images as your own photographs
- Cite AI as a tool when submitting academic work
- Respect copyright when using reference images
- Be aware of potential biases in AI-generated imagery

💡 **Pro Tip**: Save your best prompts in a document for reuse and refinement!`,
              lesson_order: 2
            },
            {
              title: "Using Descript for Video Editing",
              content: `# Using Descript for Video Editing

🎬 Descript revolutionizes video editing for students by making it as simple as editing a text document—with powerful AI assistance.

## What is Descript?

Descript is an all-in-one audio/video editor with unique AI features:
- Text-based video editing (edit video by editing the transcript)
- Overdub (AI voice cloning for corrections)
- Studio Sound (automatic audio enhancement)
- Green screen and background removal
- Filler word removal ("um", "uh", etc.)
- Screen recording with transcription

## Setting Up Descript for Academic Projects

### 1. Creating Your Account
- Sign up for a free account (limited features)
- Student discounts available for paid plans
- Download the desktop application
- Connect your microphone and camera

### 2. Understanding the Interface
- Projects panel (manage all your videos)
- Media library (store and organize assets)
- Script editor (where text meets video)
- Timeline (traditional video editing view)
- Export options (various formats and qualities)

## Key Features for Student Video Projects

### 1. Transcription-Based Editing
Perfect for course presentations and tutorials:
1. Record or import your video
2. Wait for automatic transcription
3. Edit the text document to cut mistakes
4. Words are deleted from the video automatically
5. No need for complex timeline editing

### 2. Overdub (AI Voice)
For fixing audio mistakes without re-recording:
1. Create an Overdub voice (ethical consent required)
2. Highlight text you want to change
3. Type new text
4. AI generates your voice saying the new words

### 3. Studio Sound
Instantly improve audio quality:
- Remove background noise
- Enhance voice clarity
- Balance audio levels
- Make recordings sound professional

### 4. Screen Recording
Ideal for tutorials and demonstrations:
1. Select screen capture area
2. Choose to include webcam (optional)
3. Record with automatic transcription
4. Edit out mistakes immediately after

## Project Applications for Students

### 1. Course Presentations
- Record once, edit easily
- Remove all mistakes and hesitations
- Add titles and captions from the transcript
- Incorporate visual aids seamlessly

### 2. Research Presentations
- Create professional-quality research summaries
- Include data visualizations and slides
- Edit complex explanations without re-recording
- Add citations as text overlays

### 3. Group Projects
- Each member can record their part separately
- Combine recordings with consistent audio quality
- Edit collaboratively using shared projects
- Maintain consistent pacing and tone

### 4. Language Learning
- Record pronunciation practice
- Compare your audio to reference materials
- Create flashcard videos with proper pronunciation
- Document your improvement over time

## Advanced Techniques

### 1. Composition Templates
Save time with reusable layouts:
1. Create a standard intro/outro
2. Save camera positions and backgrounds
3. Apply consistent text styles
4. Reuse across multiple videos

### 2. Multilingual Projects
Create content in multiple languages:
- Translate transcripts
- Create overdub versions in different languages
- Add subtitles from transcripts
- Export separate versions

### 3. Engaging Elements
Make videos more interesting:
- Add automatic transitions between sections
- Use script-based markers for emphasis
- Create zooms and highlights tied to specific words
- Add timed reactions and callouts

## Tips for Success

💡 **Script preparation**: Outline your content before recording
💡 **Quiet environment**: Even with Studio Sound, start with good audio
💡 **Regular saving**: Enable auto-save for project protection
💡 **Export options**: Use "Draft" quality for feedback, "High" for final versions

⚠️ **Note**: Free accounts have limitations on Overdub and export options. Consider the education discount for longer projects.`,
              lesson_order: 3
            },
            {
              title: "Using Soundraw for Music Generation",
              content: `# Using Soundraw for Music Generation

🎵 Soundraw lets students create custom, copyright-free music for their projects without any musical experience required.

## What is Soundraw?

Soundraw is an AI music generation platform that allows you to:
- Create original music tracks based on your specifications
- Customize genre, mood, length, and instruments
- Export high-quality audio for your projects
- Use music without copyright restrictions
- Adjust tracks to match your video timing

## Getting Started with Soundraw

### 1. Setting Up Your Account
- Create a free account (limited exports)
- Student plans available at discounted rates
- No software download required—works in browser
- Familiarize yourself with the interface

### 2. Understanding the Creation Process
- Genre and mood selection
- Track duration and structure
- Instrument selection and emphasis
- Intensity mapping across timeline

## Creating Your First Track

### 1. Defining Your Music Needs
Ask yourself:
- What emotion should the music convey?
- How long does the track need to be?
- Which instruments would fit your project?
- Does the energy need to vary throughout?

### 2. Step-by-Step Creation
1. Select a genre (Lo-Fi, Cinematic, Pop, etc.)
2. Choose a mood (Inspiring, Relaxed, Energetic, etc.)
3. Set track length (match to your video if applicable)
4. Adjust energy levels for different sections
5. Select featured instruments
6. Generate multiple options
7. Fine-tune your favorite version
8. Export in appropriate format

## Project Applications for Students

### 1. Video Projects
- Custom background music for presentations
- Theme music for YouTube educational channels
- Soundtrack for short films and animations
- Mood-appropriate music for documentary-style projects

### 2. Multimedia Presentations
- Opening and closing themes
- Transition music between sections
- Background ambience for spoken presentations
- Emotional underlining for impactful moments

### 3. Podcast Production
- Intro and outro music
- Segment transition sounds
- Background tracks for different topics
- Mood music for storytelling sections

### 4. Interactive Projects
- Background music for websites
- App sound design
- Game music for student-developed projects
- Interactive presentation soundtracks

## Advanced Techniques

### 1. Synchronized Music Creation
Match music to your visual content:
1. Identify key moments in your video
2. Create markers at these timestamps
3. Adjust energy levels to match visual intensity
4. Ensure musical transitions align with scene changes

### 2. Layered Audio Design
Combine multiple Soundraw tracks:
- Create ambient background layer
- Add rhythmic middle layer
- Include melodic top layer
- Mix in external sound effects if needed

### 3. Emotion Mapping
Design music to enhance emotional journey:
- Chart the emotional arc of your content
- Create music that reinforces these emotions
- Use intensity changes to signal important points
- Consider silence as a powerful tool

## Tips for Effective Music Usage

### Do:
✅ Match music energy to content pacing
✅ Consider volume levels carefully (background vs. foreground)
✅ Use different tracks for different sections
✅ Leave space for narration and important sounds

### Don't:
❌ Use music that competes with spoken content
❌ Choose distracting melodies for informational content
❌ Overuse dramatic music in academic presentations
❌ Make sudden jarring music changes

## Technical Considerations

- **Export formats**: WAV for highest quality, MP3 for smaller files
- **Mixing levels**: Ensure music sits below speech in the mix (-15dB)
- **Fade points**: Always add fades to prevent abrupt starts/stops
- **Project storage**: Save your Soundraw projects for future adjustments

💡 **Pro Tip**: Create a personal library of generated tracks categorized by mood for quick access in future projects!`,
              lesson_order: 4
            }
          ]
        },
        {
          title: "Career & Future with AI",
          description: "Explore how AI skills can enhance your career prospects and future opportunities.",
          module_order: 4,
          lessons: [
            {
              title: "Jobs that Use AI Tools",
              content: `# Jobs that Use AI Tools

💼 Understanding how different careers use AI tools can help you prepare for future job markets and develop relevant skills.

## AI Tools Across Industries

### Digital Marketing
**AI tools used:**
- Content generation tools (Copy.ai, Jasper)
- Social media schedulers with AI features
- Analytics platforms with predictive features
- Image generation for campaigns

**Example tasks:**
- Creating multiple versions of ad copy
- Personalizing email marketing campaigns
- Predicting campaign performance
- Generating visual content quickly

### Software Development
**AI tools used:**
- GitHub Copilot for code generation
- Tabnine for code completion
- AI testing tools
- Automated documentation generators

**Example tasks:**
- Suggesting code solutions
- Debugging assistance
- Automating repetitive coding tasks
- Creating API documentation

### Data Analysis
**AI tools used:**
- Automated data cleaning tools
- Predictive analytics platforms
- Natural language BI tools
- Visualization assistants

**Example tasks:**
- Identifying patterns in large datasets
- Creating predictive models
- Generating reports from data
- Translating data queries from plain English

### Healthcare
**AI tools used:**
- Diagnostic assistance tools
- Medical image analysis
- Patient data management systems
- Treatment recommendation tools

**Example tasks:**
- Analyzing medical images for anomalies
- Predicting patient risks
- Managing treatment schedules
- Research literature analysis

## Emerging AI-Enhanced Careers

### AI Prompt Engineer
**Job description:** Creating, refining, and optimizing prompts for AI systems to generate specific, high-quality outputs.

**Skills needed:**
- Understanding AI capabilities and limitations
- Clear and precise communication
- Domain expertise in application area
- Testing and iteration methodology

### Content Creator with AI
**Job description:** Using AI tools to enhance creative output across writing, design, and multimedia.

**Skills needed:**
- Strong creative direction
- Understanding of AI content tools
- Editing and refinement abilities
- Original concept development

### AI Implementation Specialist
**Job description:** Helping businesses integrate AI tools into their existing workflows and processes.

**Skills needed:**
- Change management
- Understanding of business processes
- Technical implementation knowledge
- Training and support capabilities

### AI Ethics Consultant
**Job description:** Advising on responsible AI use, bias mitigation, and ethical implications.

**Skills needed:**
- Ethics and philosophy background
- Understanding of AI technology
- Policy development experience
- Communication and advocacy skills

## How to Prepare for AI-Enhanced Jobs

### 1. Develop a "Complementary Skill Set"
Focus on skills that work alongside AI:
- Critical thinking and evaluation
- Creative direction and oversight
- Emotional intelligence and interpersonal skills
- Strategic thinking and planning

### 2. Learn to Collaborate with AI
Understand how to:
- Provide effective instructions to AI systems
- Evaluate and improve AI outputs
- Know when to use AI and when not to
- Integrate AI into your workflow efficiently

### 3. Stay Current on AI Developments
- Follow AI news and research
- Experiment with new tools as they emerge
- Join communities discussing AI applications
- Take courses on AI fundamentals

## AI Skills on Your Resume

### Highlight:
- Specific AI tools you've mastered
- Results achieved using AI collaboration
- Efficiency improvements demonstrated
- Creative applications you've developed

### Example Resume Points:
- "Increased content production by 75% using AI writing assistants while maintaining brand voice"
- "Developed custom prompt templates for team use, improving AI output quality by 40%"
- "Created AI-assisted data analysis workflow that reduced reporting time from 3 days to 4 hours"

💡 **Pro Tip**: Create a portfolio that shows both your AI-assisted work AND your unique contributions that AI couldn't provide.`,
              lesson_order: 1
            },
            {
              title: "Freelancing with AI",
              content: `# Freelancing with AI

💻 AI tools can transform freelancing by expanding your capabilities, increasing your productivity, and helping you offer more competitive services.

## Getting Started with AI-Enhanced Freelancing

### Identifying Your AI Advantage
Ask yourself:
1. Which repetitive tasks take up most of your time?
2. What services could you offer if certain tasks were automated?
3. Which skills complement AI capabilities in your field?
4. How can AI help you scale your freelance business?

### Setting Up Your AI Toolkit
Every freelancer needs:
- Content generation tools (ChatGPT, Copy.ai)
- Visual creation tools (Canva AI, Leonardo AI)
- Client management with AI features
- Field-specific AI tools for your specialty

## AI-Enhanced Freelance Services

### Writing & Content Creation
**Services you can offer:**
- Blog post creation and optimization
- Social media content packages
- Email newsletter campaigns
- eBook and guide development

**How AI helps:**
- Generate content outlines
- Create first drafts quickly
- Suggest headlines and hooks
- Repurpose content across formats

### Design & Visual Content
**Services you can offer:**
- Brand identity packages
- Social media graphics bundles
- Presentation design
- Basic animation and video editing

**How AI helps:**
- Generate initial design concepts
- Create variations quickly
- Enhance stock photos
- Automate repetitive design tasks

### Virtual Assistance
**Services you can offer:**
- Email and communication management
- Calendar organization and scheduling
- Research and data collection
- Basic customer service

**How AI helps:**
- Draft email responses
- Summarize long documents
- Extract key information from sources
- Create organized research reports

### Marketing Services
**Services you can offer:**
- SEO optimization
- Content marketing strategies
- Market research and analysis
- Ad copy and campaign creation

**How AI helps:**
- Generate keyword recommendations
- Create multiple ad variations
- Analyze competitor content
- Draft marketing plans

## Setting the Right Prices

### Value-Based Pricing Strategy
When using AI tools:
1. Price based on the value delivered, not time spent
2. Focus on outcomes and results for clients
3. Consider offering tiered packages with different levels of service
4. Don't compete solely on price—emphasize quality and expertise

### Sample Pricing Approaches:
- **Project-based:** Flat fee based on deliverable value
- **Retainer model:** Monthly fee for ongoing services
- **Hybrid approach:** Base fee plus performance bonuses
- **Productized services:** Standardized offerings with set prices

## Managing Client Expectations

### What to Disclose About AI Use
Be transparent about:
- When and how you use AI tools
- Your role in directing and editing AI output
- How AI enhances (not replaces) your expertise
- Quality control processes you implement

### Addressing Client Concerns
Common questions and how to respond:
- **"Is this just AI-generated?"** — Explain your creative direction and editing process
- **"Why hire you if AI can do it?"** — Highlight your expertise in guiding the AI and ensuring quality
- **"Is this original work?"** — Explain how you ensure originality and perform checks

## Scaling Your AI-Enhanced Freelance Business

### 1. Create Reusable Systems
Develop:
- Custom prompt templates for different projects
- Quality control checklists
- Client onboarding processes with AI assistance
- Standardized workflows for common tasks

### 2. Productize Your Services
Package your expertise into:
- Digital products with AI components
- Online courses teaching your AI methods
- Templates and guides for clients
- Subscription services for ongoing work

### 3. Build a Specialized Niche
Position yourself as:
- An expert in a specific industry using AI
- A problem solver for particular challenges
- The bridge between AI capabilities and human needs
- A consultant who helps others implement AI tools

## Ethical Considerations

### Do:
✅ Be transparent about AI use when relevant
✅ Maintain quality control over all deliverables
✅ Continuously learn and improve your prompting skills
✅ Add unique value beyond what AI alone provides

### Don't:
❌ Misrepresent AI work as entirely manual
❌ Deliver raw AI outputs without review
❌ Neglect to check for accuracy and originality
❌ Undervalue your expertise in directing the AI

💡 **Pro Tip**: Document your AI processes and workflows to create consistency and save time on future projects!`,
              lesson_order: 2
            },
            {
              title: "Building Your Own AI Portfolio",
              content: `# Building Your Own AI Portfolio

🚀 Creating a portfolio that showcases your AI skills can significantly boost your career opportunities and demonstrate your future-ready capabilities.

## Understanding the AI Portfolio

### What Makes an AI Portfolio Different
An effective AI portfolio should showcase:
- Your ability to direct AI tools effectively
- How you solve problems using AI
- Your understanding of AI capabilities and limitations
- Your unique value beyond what AI alone provides

### Types of AI Portfolios
Depending on your goals:
1. **Skills showcase**: Demonstrating various AI tools you can use
2. **Results-focused**: Highlighting outcomes achieved with AI
3. **Process-oriented**: Showing your workflow and methodology
4. **Solution-based**: Presenting problems you've solved using AI

## Essential Elements of Your AI Portfolio

### 1. Case Studies
For each project, include:
- The original challenge or goal
- Your approach and AI tools used
- Your role vs. the AI's contribution
- Before-and-after results
- Lessons learned and improvements made

### 2. Process Documentation
Show your workflow:
- Initial prompts and directions given to AI
- Iterations and refinements
- Editing and quality control steps
- Final polishing and human touches

### 3. Skill Demonstration
Highlight your abilities in:
- Prompt engineering (crafting effective instructions)
- Output evaluation and refinement
- Combining multiple AI tools in a workflow
- Adapting AI capabilities to specific needs

### 4. Continuous Learning Evidence
Demonstrate your growth:
- New AI tools you've mastered
- Improvements in your prompting techniques
- Classes, certifications, or training completed
- Experimentation with emerging AI capabilities

## Building Your First AI Projects

### 1. Personal Enhancement Projects
Start with projects improving your own work:
- Create a blog with AI-assisted content
- Develop a personal website with AI design elements
- Build a productivity system using AI tools
- Create a social media content calendar with AI

### 2. Fictional Client Work
Create sample projects for imaginary clients:
- Branding package for a startup
- Marketing campaign for a product
- Content strategy for a blog
- Design system for an app

### 3. Real-World Problem Solving
Address actual challenges:
- Improve a local business's online presence
- Create educational materials for a community organization
- Develop resources for fellow students
- Solve a common problem in your field

### 4. AI Tool Comparisons
Conduct and document experiments:
- Compare different AI writing tools on the same brief
- Test various image generation tools for specific uses
- Evaluate chatbots for customer service scenarios
- Assess productivity gains across different AI assistants

## Presenting Your AI Portfolio

### 1. Portfolio Website
Create a dedicated site with:
- Clear organization by project type
- Detailed case studies
- Before-and-after examples
- Your methodology and process

### 2. Documentation Formats
Effective ways to showcase your work:
- Screen recordings of your AI workflow
- Side-by-side comparisons
- Process diagrams and flowcharts
- Written explanations of your approach

### 3. Demonstrating Value
Highlight metrics such as:
- Time saved using AI methods
- Quality improvements achieved
- Cost reductions demonstrated
- New capabilities enabled by AI

## Ethical Considerations for Your Portfolio

### Transparency
- Clearly state when and how AI was used
- Don't misrepresent AI-generated work as entirely manual
- Give proper credit to the specific AI tools used
- Explain your role in the creative process

### Originality
- Focus on your unique contributions and direction
- Demonstrate how you refined and improved AI outputs
- Show your problem-solving approach, not just results
- Highlight your expertise in guiding the AI effectively

## Leveraging Your Portfolio

### For Job Applications:
- Reference specific portfolio projects in cover letters
- Prepare to discuss your AI workflow in interviews
- Show how your AI skills address employer needs
- Highlight transferable skills across different tools

### For Freelancing:
- Share relevant case studies with potential clients
- Create comparison examples for common client requests
- Demonstrate your quality control process
- Explain how AI helps you deliver better results faster

💡 **Pro Tip**: Keep updating your portfolio with new AI tools and techniques as they emerge—this field moves quickly!`,
              lesson_order: 3
            }
          ]
        }
      ]
    };
    
    // Create Stock Market course
    const stockMarketCourse: CourseData = {
      title: "Introduction to Stock Investment",
      price: 1000,
      referral_reward: 500,
      description: "Learn the basics of stock market investing with practical strategies for students.",
      modules: [
        {
          title: "Basics of Investing",
          description: "Understand the fundamentals of investing and why starting early matters.",
          module_order: 1,
          lessons: [
            {
              title: "What is the Stock Market?",
              content: `# What is the Stock Market?

💹 The stock market is a place where people can buy and sell ownership shares in companies.

## The Stock Market Explained Simply

The stock market is like a big marketplace where instead of buying fruits or clothes, people buy and sell small pieces of companies called "shares" or "stocks."

When you own a share of a company, you actually own a small part of that business. If the company does well and makes money, your shares usually become more valuable. If the company struggles, your shares might lose value.

## How the Stock Market Works

### 1. Companies Need Money to Grow
- To expand their business
- To develop new products
- To hire more employees
- To build new facilities

### 2. Companies "Go Public" to Raise Money
- They divide ownership into many small shares
- They sell these shares to investors through an Initial Public Offering (IPO)
- The company gets money to grow
- Investors get ownership stakes in the company

### 3. Shares Are Traded on Stock Exchanges
Popular stock exchanges include:
- National Stock Exchange (NSE) in India
- Bombay Stock Exchange (BSE) in India
- New York Stock Exchange (NYSE) in the US
- NASDAQ in the US

### 4. Share Prices Change Based on:
- Company performance
- Industry trends
- Economic factors
- Investor sentiment
- Supply and demand for shares

## Stock Market Participants

### Individual Investors
Regular people like you who buy shares hoping they'll increase in value

### Institutional Investors
Large organizations that manage money for others:
- Mutual funds
- Pension funds
- Insurance companies
- Banks

### Brokers
People or companies that help you buy and sell shares for a fee

### Regulators
Government organizations that create and enforce rules:
- Securities and Exchange Board of India (SEBI) in India
- Securities and Exchange Commission (SEC) in the US

## Why the Stock Market Matters

### For Companies:
- Access to capital for growth
- Increased visibility and credibility
- Ability to attract top talent through stock options

### For Investors:
- Opportunity to grow wealth over time
- Chance to earn more than savings accounts
- Way to own part of successful companies
- Protection against inflation

### For the Economy:
- Helps companies create jobs
- Encourages innovation and growth
- Allows everyday people to benefit from economic growth

## Key Concepts to Understand

### Bull Market vs. Bear Market
- **Bull Market**: Prices are rising, optimism is high
- **Bear Market**: Prices are falling, pessimism is high

### Index
A group of stocks that represents a section of the market:
- NIFTY 50 (tracks 50 large Indian companies)
- SENSEX (tracks 30 large companies on BSE)
- S&P 500 (tracks 500 large US companies)

### Volatility
How much and how quickly stock prices move up and down

📝 **Remember**: The stock market involves risk—prices can go up AND down. Never invest money you can't afford to lose!`,
              lesson_order: 1
            },
            {
              title: "Why Should Students Invest Early?",
              content: `# Why Should Students Invest Early?

⏰ Starting your investment journey as a student—even with small amounts—can give you enormous advantages over time.

## The Power of Starting Early

### Time is Your Greatest Advantage
When you're young, you have a resource that no amount of money can buy: time.

Take a look at these examples of how Rs. 10,000 grows at 12% average annual returns:
- Starting at age 20: Rs. 10,000 becomes **Rs. 9,30,509** by age 55
- Starting at age 30: Rs. 10,000 becomes **Rs. 2,89,002** by age 55
- Starting at age 40: Rs. 10,000 becomes **Rs. 89,542** by age 55

This huge difference happens because of compound interest—what Einstein allegedly called "the eighth wonder of the world."

## What is Compound Interest?

Compound interest means earning interest on your interest. It creates a snowball effect where your money grows faster and faster over time.

### Compound Interest Example:
If you invest Rs. 5,000 and earn 10% per year:
- Year 1: Rs. 5,000 + Rs. 500 (10%) = Rs. 5,500
- Year 2: Rs. 5,500 + Rs. 550 (10%) = Rs. 6,050
- Year 3: Rs. 6,050 + Rs. 605 (10%) = Rs. 6,655
- Year 10: Rs. 12,969
- Year 30: Rs. 87,247

Notice how the amount you earn each year keeps getting bigger!

## Student-Specific Advantages

### 1. Longer Recovery Time
You can afford to take some risks because you have decades to recover from any losses.

### 2. Learning Opportunity
Starting now gives you more time to:
- Learn from mistakes when the stakes are lower
- Understand how markets work through experience
- Develop good financial habits early

### 3. Lower Financial Obligations
Most students have:
- No mortgage payments
- No children to support
- Fewer bills than they will later in life

This means even small savings can go toward investments.

### 4. Building a Financial Foundation
By starting early, you're setting yourself up for:
- Less financial stress in the future
- More options and opportunities later in life
- Potential financial independence at a younger age
- Ability to take career risks later with a financial safety net

## How to Start as a Student (Even with Limited Funds)

### 1. Start Super Small
Even Rs. 500 per month can grow significantly over time.

### 2. Use Technology
Apps and platforms make it easy to start with minimal amounts:
- Zerodha Coin
- Groww
- ET Money
- Other micro-investment apps

### 3. Automate Your Investments
Set up automatic transfers on scholarship/stipend days.

### 4. Invest Rather than Speculate
Focus on long-term growth, not get-rich-quick schemes.

## Real Examples of Student Investors

> "I started investing Rs. 1,000 per month from my scholarship money when I was 19. By graduation, I had built a portfolio worth Rs. 75,000, which continues to grow."

> "Instead of spending my internship salary on new gadgets, I invested 70% of it in index funds. Three years later, it's already grown by 30%."

## The Psychological Advantage

Starting early also helps you:
- Get comfortable with market fluctuations
- Develop patience as an investor
- Build confidence in your financial decisions
- Create a positive relationship with money

## Action Steps for Students

1. Open a demat account (many have zero balance requirements for students)
2. Start with an index fund or ETF (less research required)
3. Set up a small recurring investment
4. Learn continuously about investing
5. Gradually increase your contributions as your income grows

💡 **Remember**: The goal isn't to get rich overnight but to build wealth steadily over time. The earlier you plant the seed, the bigger the tree will grow!`,
              lesson_order: 2
            },
            {
              title: "Common Myths About Investing",
              content: `# Common Myths About Investing

🔍 Let's debunk some widespread misconceptions that might be keeping you from starting your investment journey.

## Myth #1: "You Need Lots of Money to Start Investing"

### The Reality:
You can start investing with as little as Rs. 100-500 in India.

### How to Invest with Limited Funds:
- **Systematic Investment Plans (SIPs)**: Start with Rs. 500 monthly
- **Fractional shares**: Own portions of expensive stocks
- **Index funds**: Get diversified exposure with minimal investment
- **Direct stock purchase**: Some stocks trade for under Rs. 50

> "I started investing with just Rs. 500 per month from my pocket money. After three years in college, I had built a habit and a growing portfolio."

## Myth #2: "Investing is Like Gambling"

### The Reality:
Investing and gambling are fundamentally different:

| Gambling | Long-Term Investing |
|----------|---------------------|
| Based on luck | Based on research and fundamentals |
| House has edge | Markets historically trend upward |
| Zero-sum game | Value creation over time |
| Short-term focus | Long-term perspective |
| Usually loses value | Historically gains value |

### Responsible Investing Approach:
- Research before investing
- Diversify across different investments
- Focus on long-term growth
- Invest regularly regardless of market conditions

## Myth #3: "You Need to be a Financial Expert"

### The Reality:
You don't need advanced degrees or complex formulas to be a successful investor.

### Simple Starting Strategies:
- **Index funds**: Track the market automatically
- **SIP in diversified mutual funds**: Professional management
- **ETFs**: Trade like stocks but offer diversification
- **Robo-advisors**: Automated investment management

### Basic Knowledge is Sufficient:
- Understanding compound interest
- Knowing the difference between stocks, bonds, and funds
- Learning to control emotions during market swings
- Following a consistent investment plan

## Myth #4: "It's Better to Wait for the 'Right Time'"

### The Reality:
Market timing rarely works even for professionals.

### Why "Time in the Market" Beats "Timing the Market":
- Missing just the 10 best days in the market can dramatically reduce returns
- Markets are unpredictable in the short term
- Regular investing removes the pressure of timing decisions
- Cost averaging reduces the impact of market volatility

**Example:** Rs. 10,000 invested in Nifty 50 for 10 years:
- Staying fully invested: ~Rs. 25,000
- Missing 10 best days: ~Rs. 15,000
- Missing 20 best days: ~Rs. 10,000 (no gain)

## Myth #5: "Young People Should Focus on Making Money First"

### The Reality:
Starting small early is much more powerful than waiting until you have "enough" money.

### The Math:
- Rs. 1,000/month from age 20-30 (just 10 years) and then stopping
- Rs. 1,000/month from age 30-60 (30 years)

**Result at age 60 (assuming 10% returns):**
- Early investor (total invested: Rs. 1.2 lakhs): ~Rs. 22 lakhs
- Later investor (total invested: Rs. 3.6 lakhs): ~Rs. 20 lakhs

The early investor puts in 1/3 of the money but ends up with more!

## Myth #6: "Stock Market is Only for Rich People"

### The Reality:
The market is more accessible than ever to people of all income levels.

### Democratization of Investing:
- Zero-fee trading platforms
- No minimum balance requirements
- Fractional share investing
- Mobile investing apps
- Educational resources freely available online

## Myth #7: "I'll Lose All My Money in a Market Crash"

### The Reality:
Market crashes are temporary if you're properly diversified and have a long-term perspective.

### Historical Perspective:
Every major market crash has been followed by recovery and new highs:
- 2008 Global Financial Crisis: Markets recovered within 4 years
- 2020 COVID Crash: Markets recovered within months
- 2000 Dot-com Bubble: Markets recovered within 7 years

### Protection Strategies:
- Diversification across different types of investments
- Gradual entry into markets through SIPs
- Investing only money you won't need soon
- Having an emergency fund before investing

💡 **Pro Tip:** The best approach for students is often the simplest one: start with an index fund SIP, contribute regularly, ignore short-term market noise, and focus on your studies while your money works for you.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "Understanding Stocks",
          description: "Learn about different types of stocks and factors that influence stock prices.",
          module_order: 2,
          lessons: [
            {
              title: "Types of Stocks (Blue-chip, Penny Stocks, etc.)",
              content: `# Types of Stocks (Blue-chip, Penny Stocks, etc.)

🧩 Stocks come in many varieties, each with different characteristics, risks, and potential rewards.

## Blue-chip Stocks

### What They Are:
Shares of large, well-established, financially stable companies with excellent reputations.

### Characteristics:
- Long operating history (often decades)
- Market leaders in their industry
- Consistent dividend payments
- Strong balance sheets
- Less volatile than the overall market

### Examples in India:
- Reliance Industries
- HDFC Bank
- Tata Consultancy Services (TCS)
- Infosys
- ITC

### Best For:
- Beginners
- Long-term investors
- Lower-risk portfolios
- Dividend income seekers

## Growth Stocks

### What They Are:
Shares of companies expected to grow at an above-average rate compared to other companies.

### Characteristics:
- Rapidly increasing revenue and earnings
- Often reinvest profits (don't pay dividends)
- Higher price-to-earnings ratios
- Can be more volatile
- Often in technology, healthcare, or emerging industries

### Examples in India:
- Avenue Supermarts (D-Mart)
- Dixon Technologies
- Tata Elxsi
- Laurus Labs

### Best For:
- Investors seeking capital appreciation
- Those with longer time horizons
- Moderate risk tolerance
- Portfolios not focused on current income

## Value Stocks

### What They Are:
Shares of companies that appear to be undervalued based on fundamental analysis.

### Characteristics:
- Lower price-to-earnings ratios
- Higher dividend yields
- Price below book value
- Solid fundamentals despite being out of favor
- Often in traditional industries

### Examples in India:
- Coal India
- ONGC
- Power Grid Corporation
- Some PSU banks

### Best For:
- Patient investors
- Contrarian strategists
- Income-focused portfolios
- Those who can withstand short-term volatility

## Penny Stocks

### What They Are:
Shares of very small companies that trade at low prices per share (typically below Rs. 10).

### Characteristics:
- Extremely volatile
- Limited company history
- Often lack transparency
- Minimal analyst coverage
- High risk of manipulation
- Potential for large percentage gains (and losses)

### Best For:
- Experienced investors only
- Those who can afford to lose their entire investment
- People who can do extensive research
- Traders with high risk tolerance

⚠️ **Warning**: Most beginning investors should AVOID penny stocks entirely.

## Dividend Stocks

### What They Are:
Shares of companies that pay out regular dividends to shareholders.

### Characteristics:
- Regular income payments
- Often mature, profitable companies
- Generally more stable
- Lower growth potential
- Popular in certain sectors (utilities, consumer staples)

### Examples in India:
- Coal India
- ITC
- Power Grid
- Hindustan Zinc

### Best For:
- Income-focused investors
- Retirees or those nearing retirement
- Lower-risk portfolios
- Those seeking inflation protection

## Cyclical Stocks

### What They Are:
Shares of companies whose profits are strongly tied to economic cycles.

### Characteristics:
- Performance follows economic expansions and contractions
- More volatile than the overall market
- Timing is crucial for good returns
- Often in industries like automobiles, construction, travel

### Examples in India:
- Tata Motors
- Larsen & Toubro
- InterGlobe Aviation (IndiGo)
- Mahindra & Mahindra

### Best For:
- Investors who can time economic cycles
- Those willing to actively manage positions
- Medium to high risk tolerance
- People who follow macroeconomic trends

## Defensive Stocks

### What They Are:
Shares of companies that provide goods/services people need regardless of economic conditions.

### Characteristics:
- Relatively stable during economic downturns
- Lower growth during economic booms
- Often pay dividends
- Less volatile than the market
- Common in sectors like healthcare, utilities, consumer staples

### Examples in India:
- Hindustan Unilever
- Nestle India
- Britannia Industries
- Apollo Hospitals

### Best For:
- Risk-averse investors
- Portfolio protection during downturns
- Those seeking stability

## ESG (Environmental, Social, Governance) Stocks

### What They Are:
Shares of companies with strong environmental, social responsibility, and corporate governance practices.

### Characteristics:
- Focus on sustainability and ethical practices
- Growing investor interest, especially among younger generations
- Often in renewable energy, clean technology, healthcare
- May have different risk/return profiles

### Examples in India:
- Tata Power (renewable energy focus)
- Tech Mahindra (sustainability initiatives)
- Dr. Reddy's Laboratories (social initiatives)

### Best For:
- Values-based investors
- Those seeking alignment with personal principles
- Long-term investors
- Diversification

💡 **Pro Tip for Beginners**: Start with a diversified portfolio containing predominantly blue-chip and large-cap stocks. As you gain experience and knowledge, you can gradually explore other stock types based on your risk tolerance and financial goals.`,
              lesson_order: 1
            },
            {
              title: "How to Read a Stock Chart",
              content: `# How to Read a Stock Chart

📊 Stock charts can seem intimidating at first, but understanding them is essential for making informed investment decisions.

## The Basics of Stock Charts

A stock chart is a visual representation of a stock's price movement over time. Think of it as the "heartbeat monitor" of a company's stock.

### Main Components of a Basic Chart:

1. **Price Axis (Y-axis)**
   - Shows the stock price
   - Usually on the right or left side
   - May use logarithmic or arithmetic scale

2. **Time Axis (X-axis)**
   - Shows the time period
   - Can range from minutes to years
   - Common timeframes: 1-day, 1-week, 1-month, 1-year, 5-year

3. **Price Plot**
   - Line, bar, or candlestick representing price movement
   - Each point shows the stock price at that moment

4. **Volume Bars**
   - Displayed at the bottom of most charts
   - Shows how many shares were traded in each period
   - Higher bars indicate more trading activity

## Types of Stock Charts

### 1. Line Charts
**What it shows:** Closing prices connected by a line
**Best for:** Getting a simple, clean view of price trends
**When to use:** When you want to see the big picture without details

### 2. Bar Charts
**What it shows:** Open, high, low, and close prices for each period
**How to read a bar:**
- Vertical line shows high and low prices
- Left horizontal tick shows opening price
- Right horizontal tick shows closing price
**Best for:** More detailed analysis than line charts

### 3. Candlestick Charts
**What it shows:** Open, high, low, and close prices in a visually intuitive format
**How to read a candlestick:**
- Green/white candle: Closing price higher than opening (price went up)
- Red/black candle: Closing price lower than opening (price went down)
- Body: Range between open and close prices
- Wicks/shadows: Show the high and low prices
**Best for:** Detailed price analysis and pattern recognition

## Essential Chart Patterns

### Uptrend
- Series of higher highs and higher lows
- Generally bullish signal
- Example: [ Insert simple uptrend diagram ]

### Downtrend
- Series of lower highs and lower lows
- Generally bearish signal
- Example: [ Insert simple downtrend diagram ]

### Support Level
- Price level where a stock tends to stop falling
- Shows where buyers typically step in
- Often used as a potential buying point

### Resistance Level
- Price level where a stock tends to stop rising
- Shows where sellers typically step in
- Often used as a potential selling point

### Common Candlestick Patterns

**Doji**
- Open and close prices are virtually the same
- Indicates indecision in the market
- Can signal potential reversal

**Hammer**
- Small body with a long lower shadow
- Appears in downtrends
- Potential bullish reversal signal

**Shooting Star**
- Small body with a long upper shadow
- Appears in uptrends
- Potential bearish reversal signal

## Technical Indicators

These mathematical calculations help analyze trends and predict future price movements:

### Moving Averages
- Line showing average price over a specific period
- Smooths out price data to show trends
- Common periods: 50-day, 100-day, 200-day
- Golden Cross (bullish): Short-term MA crosses above long-term MA
- Death Cross (bearish): Short-term MA crosses below long-term MA

### Relative Strength Index (RSI)
- Measures speed and change of price movements
- Scale of 0 to 100
- Above 70: Potentially overbought (may fall soon)
- Below 30: Potentially oversold (may rise soon)

### MACD (Moving Average Convergence Divergence)
- Shows relationship between two moving averages
- MACD line: Difference between 12-day and 26-day EMA
- Signal line: 9-day EMA of MACD line
- Histogram: Difference between MACD and signal line
- Crossovers can indicate buy/sell opportunities

## How to Use Charts Effectively

### 1. Start with the Big Picture
- Look at longer timeframes first (yearly, monthly)
- Identify the primary trend
- Then zoom in to shorter timeframes for entry/exit points

### 2. Combine Multiple Timeframes
- Long-term charts show the trend
- Intermediate charts show the pullbacks
- Short-term charts help with timing

### 3. Compare with Benchmarks
- Look at relevant index charts (NIFTY, SENSEX)
- Compare with sector performance
- Understand relative strength/weakness

### 4. Volume Confirmation
- Price movements with higher volume are more significant
- Low volume moves may reverse quickly
- Volume often precedes price movement

## Chart Reading Practice Tips

### 1. Historical Analysis
- Study past chart patterns and their outcomes
- Look for patterns that repeat
- Note which indicators were most reliable

### 2. Paper Trading
- Practice making decisions based on charts
- Track your hypothetical trades
- Review and learn from mistakes

### 3. Start Simple
- Begin with line charts and basic support/resistance
- Add more complex indicators gradually
- Focus on one or two indicators at first

💡 **Pro Tip**: Don't rely solely on charts for investment decisions. Combine technical analysis (charts) with fundamental analysis (company financials, news, industry trends) for a more complete picture.`,
              lesson_order: 2
            },
            {
              title: "What Influences Stock Prices?",
              content: `# What Influences Stock Prices?

💰 Stock prices move up and down based on a complex mixture of factors—some logical, some emotional, and some completely unexpected.

## Supply and Demand Basics

At its core, a stock price moves based on:
- **More buyers than sellers** = price goes up
- **More sellers than buyers** = price goes down

But what makes people want to buy or sell? Let's explore the key factors.

## Company-Specific Factors

### 1. Financial Performance
- **Earnings reports**: Quarterly and annual profit announcements
- **Revenue growth**: Increasing sales year-over-year
- **Profit margins**: How efficiently the company turns revenue into profit
- **Cash flow**: Money flowing in and out of the business

> "Earnings are the ultimate driver of stock prices in the long run."

### 2. Company News and Announcements
- **New products or services**: Potential new revenue streams
- **Management changes**: New CEO or key executive appointments
- **Mergers and acquisitions**: Buying other companies or being bought
- **Partnerships and deals**: New strategic relationships
- **Legal issues**: Lawsuits, regulatory problems, or settlements

### 3. Future Outlook and Guidance
- **Company forecasts**: Management's predictions for future performance
- **Growth plans**: Expansion into new markets or product lines
- **Restructuring**: Cost-cutting or reorganization plans
- **Dividend announcements**: Changes to shareholder payments

## Industry and Economic Factors

### 1. Sector Performance
- **Industry trends**: How similar companies are performing
- **Disruption**: New technologies changing the industry landscape
- **Regulatory changes**: New laws or rules affecting the sector
- **Commodity prices**: Changes in raw material costs

### 2. Economic Indicators
- **GDP growth**: Overall economic health
- **Inflation rates**: Rising prices in the economy
- **Interest rates**: Central bank policies (RBI in India)
- **Employment data**: Job creation and unemployment figures
- **Consumer spending**: How much people are buying

### 3. Global Events
- **Geopolitical developments**: Wars, trade tensions, international relations
- **Natural disasters**: Earthquakes, floods, pandemics
- **Oil price movements**: Energy cost impacts across industries
- **Currency fluctuations**: Changes in exchange rates

## Market Sentiment and Psychology

### 1. Investor Emotions
- **Fear**: Can cause panic selling and price drops
- **Greed**: Can cause buying frenzies and price bubbles
- **FOMO**: Fear Of Missing Out driving purchases
- **Overconfidence**: Believing you know more than you do

### 2. Market Momentum
- **Trend following**: Investors buying because prices are rising
- **Contrarian investing**: Going against the crowd
- **Short squeezes**: Forced buying by those who bet against stocks
- **Technical factors**: Chart patterns triggering buying or selling

### 3. Analyst Opinions
- **Upgrades/downgrades**: Changed recommendations from experts
- **Price targets**: Analysts' predictions for future stock values
- **Research reports**: Detailed analysis of companies
- **Media coverage**: News stories and financial TV discussions

## How These Factors Interact

### Short-term vs. Long-term Influences

**Short-term price movements** (days to weeks) are often driven by:
- News headlines
- Analyst upgrades/downgrades
- Earnings surprises
- Market sentiment
- Technical trading

**Long-term price movements** (months to years) are typically driven by:
- Consistent earnings growth
- Competitive advantages
- Management quality
- Industry position
- Economic fundamentals

### The Weight of Different Factors

Factors don't influence all stocks equally:
- **Growth stocks**: More sensitive to future expectations and interest rates
- **Value stocks**: More responsive to current earnings and dividends
- **Cyclical stocks**: Heavily influenced by economic indicators
- **Small-cap stocks**: Often more volatile and news-sensitive
- **Blue-chip stocks**: Generally more stable with less dramatic reactions

## How to Analyze What's Affecting a Stock

### 1. Fundamental Analysis Framework
Ask these questions:
- How are the company's earnings trending?
- How do valuation metrics compare to peers?
- What's happening in the broader industry?
- Are there significant upcoming catalysts?

### 2. News Analysis
- Distinguish between meaningful news and noise
- Consider if news impacts long-term business value
- Watch how the stock reacts to different types of news

### 3. Context is Key
- A 2% move might be normal for one stock but significant for another
- Same news can affect different companies differently
- Market environment changes how news is interpreted

## Practical Examples

### Example 1: Interest Rate Increases
- **Banks**: Often benefit from higher interest margins
- **Real estate**: May suffer from higher borrowing costs
- **Growth tech stocks**: Often decline due to future earnings being worth less
- **Dividend stocks**: May lose appeal compared to safer bonds

### Example 2: New Smartphone Launch
- **Manufacturer**: Direct revenue impact
- **Component suppliers**: Increased orders and revenue
- **Competitors**: Potential market share loss
- **App developers**: New opportunities or challenges

💡 **Pro Tip**: When a stock moves significantly, always ask "Why?" and try to identify which factor is most responsible. This builds your understanding of cause and effect in the market.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "Getting Started",
          description: "Learn practical steps to begin your investment journey.",
          module_order: 3,
          lessons: [
            {
              title: "How to Open a Demat Account",
              content: `# How to Open a Demat Account

💼 A demat account is your gateway to stock market investing in India. Here's how to set one up quickly and easily.

## What is a Demat Account?

A demat (dematerialized) account holds your shares and securities in electronic form—similar to how a bank account holds your money.

### Why You Need One:
- It's required for buying and selling shares in India
- It eliminates the risks of physical share certificates
- It makes trading faster and more convenient
- It provides a single view of all your investments

### Key Components of Stock Market Accounts:

1. **Demat Account**: Where your shares are stored
2. **Trading Account**: Used to buy and sell securities
3. **Bank Account**: Linked for money transfers

Most brokers now offer all three as an integrated package.

## Choosing the Right Broker

### Types of Brokers:

#### Discount Brokers
**Pros:**
- Lower fees (flat fee per trade, often Rs. 0-20)
- Good for self-directed investors
- User-friendly mobile apps
- No relationship manager

**Examples:**
- Zerodha
- Upstox
- Angel One
- Groww
- 5paisa

#### Full-Service Brokers
**Pros:**
- Research and advisory services
- Relationship managers
- Multiple investment products
- Physical branches

**Cons:**
- Higher fees (often percentage-based)

**Examples:**
- ICICI Direct
- HDFC Securities
- Sharekhan
- Kotak Securities

### Factors to Consider When Choosing:
- **Brokerage fees**: Compare cost per transaction
- **Account maintenance charges**: Annual fees
- **User interface**: Test the app/website
- **Customer service**: Read reviews
- **Additional services**: Research, tools, educational resources
- **Account minimum**: Starting deposit requirements

## Step-by-Step Process to Open a Demat Account

### 1. Choose a Depository Participant (DP)
In India, there are two depositories:
- National Securities Depository Limited (NSDL)
- Central Depository Services Limited (CDSL)

Most popular brokers are registered with both.

### 2. Collect Required Documents
You'll need:
- PAN card (mandatory)
- Aadhaar card
- Address proof (utility bill, passport, etc.)
- Identity proof (if different from above)
- Income proof (optional, for trading limits)
- Bank statement or canceled cheque
- Passport-size photographs

### 3. Complete KYC Process
KYC (Know Your Customer) can be completed in two ways:

**Online Method:**
1. Visit broker's website or download their app
2. Select "Open an Account"
3. Fill in personal details
4. Upload scanned documents
5. Complete IPV (In-Person Verification) via video call
6. Sign digitally using Aadhaar OTP

**Offline Method:**
1. Download and fill the account opening form
2. Attach required documents
3. Submit to the broker's office
4. Complete IPV in person

### 4. Sign the Agreement
- Review the broker-client agreement carefully
- Understand the fee structure and terms

### 5. Complete the Bank Account Linking
- Provide your bank account details
- This account will be used for transactions

### 6. Receive Your Account Details
After approval (usually 1-3 business days), you'll receive:
- Demat account number (DP ID and Client ID)
- Trading account ID
- Login credentials for the trading platform

### 7. Fund Your Account
- Transfer money from your bank account
- Most brokers offer instant funding via UPI/net banking

## Costs Involved

### One-Time Charges:
- Account opening fee (many brokers now offer free opening)

### Recurring Charges:
- Annual maintenance charges (AMC): Rs. 0-750/year
- Transaction fees:
  - Brokerage: Varies by broker
  - STT (Securities Transaction Tax): 0.1% on buy and sell for delivery
  - Exchange transaction charges: Small percentage
  - GST: 18% on brokerage and charges
  - SEBI charges: Very minimal

## Student-Specific Considerations

### Advantages for Students:
- Many brokers offer zero or discounted AMC for students
- Lower minimum deposit requirements with student ID
- Access to educational resources and demo accounts

### Budget Options:
- Zerodha: Rs. 0 account opening, Rs. 300/year AMC
- Groww: Rs. 0 account opening, Rs. 0 AMC for first year
- Angel One: Offers student discounts on request

## Getting Started After Account Opening

### Immediate Next Steps:
1. Explore the trading platform
2. Use the demo/virtual trading feature
3. Set up watchlists for stocks you're interested in
4. Start with small investments
5. Set up regular deposits for disciplined investing

💡 **Pro Tip for Students**: Start with a SIP (Systematic Investment Plan) in an index fund with as little as Rs. 500/month. This builds the investing habit while you learn more about individual stocks.

## Common Questions for New Investors

### How long does it take to open an account?
With online KYC, as quick as 1-2 days; offline may take 3-7 days.

### Can I have multiple demat accounts?
Yes, you can open accounts with different brokers.

### What if I move to a different city?
Demat accounts are accessible online from anywhere in India.

### How secure are demat accounts?
They're regulated by SEBI and protected by multiple security layers including 2FA.`,
              lesson_order: 1
            },
            {
              title: "Picking Your First Stock",
              content: `# Picking Your First Stock

🔎 Selecting your first stock is an exciting milestone in your investment journey. Here's how to make an informed choice that balances opportunity with reasonable risk.

## Start with the Right Approach

Before diving into specific stocks, establish a solid foundation:

### Set Realistic Expectations
- Your first stock investment is a learning experience
- Don't expect to get rich quickly
- Success should be measured by what you learn, not just returns

### Determine Your Investment Amount
- Only invest money you can afford to lose
- For students, start with a small amount (Rs. 1,000-5,000)
- This reduces pressure and emotional decision-making

### Establish a Time Horizon
- Plan to hold for at least 1-3 years
- Avoid day trading or short-term speculation
- Long-term investing reduces risk and pressure

## Step-by-Step Process for Stock Selection

### 1. Start with What You Know
Look at products, services, and companies you:
- Use regularly
- Understand how they make money
- Have genuine interest in
- Can explain to someone else

**Examples for Students:**
- Tech products you use daily
- Favorite food and beverage brands
- Retailers you shop with
- Entertainment services you subscribe to

### 2. Basic Financial Health Check
Even for beginners, check these fundamentals:
- **Consistent revenue growth**: Sales increasing year over year
- **Profitability**: Company makes money (positive earnings)
- **Manageable debt**: Not excessive compared to industry average
- **Dividend history**: Record of shareholder payments (if applicable)

### 3. Industry Analysis
Consider the industry's health and future:
- Is it growing or shrinking?
- Is technology disrupting it?
- Are there regulatory challenges?
- How cyclical is it?

### 4. Competitive Position
Evaluate the company's standing:
- What makes it different from competitors?
- Does it have a "moat" (sustainable advantage)?
- Is it a leader or follower in its industry?
- Does it have loyal customers?

### 5. Quality Management
Research company leadership:
- Experience and track record of the CEO
- Longevity of key executives
- Clear communication with shareholders
- Ownership stake in the company

## Beginner-Friendly Stock Categories

### Blue-Chip Companies
**Why they're good first picks:**
- Established business models
- Financial stability
- Less volatile than smaller companies
- Often pay dividends

**Indian examples:**
- HDFC Bank
- Hindustan Unilever
- TCS
- Reliance Industries

### Consumer Companies You Understand
**Why they're good first picks:**
- Familiar business models
- Easy to monitor through personal experience
- Often stable demand for products

**Indian examples:**
- Asian Paints
- Titan Company
- Nestle India
- Britannia Industries

### Dividend-Paying Stocks
**Why they're good first picks:**
- Regular income supplements growth
- Generally more stable companies
- Dividend provides some return even if stock price doesn't increase
- Management discipline required to maintain dividends

**Indian examples:**
- ITC
- Power Grid Corporation
- Coal India
- NTPC

## Research Tools for Beginners

### Free Research Sources:
- **Screener.in**: Financial data and ratios
- **Trendlyne**: Stock screening and analysis
- **Tickertape**: User-friendly research platform
- **MoneyControl**: News and basic analysis
- **Annual reports**: Company's official communication

### Key Metrics for First-Time Investors:
- **P/E Ratio**: Price relative to earnings (lower generally means better value)
- **Debt-to-Equity**: Lower is generally better
- **Return on Equity**: Higher shows efficient use of capital
- **Operating Margin**: Higher indicates pricing power
- **Revenue Growth**: Consistent increases are positive

## Common First-Stock Mistakes to Avoid

### 1. Following Tips Without Research
- Never buy based solely on someone's recommendation
- Always do your own basic research
- Understand why you're buying a particular stock

### 2. Investing Too Much in One Stock
- Your first stock should be a small portion of your savings
- Don't concentrate too much in one company

### 3. Expecting Quick Profits
- Stock investing is a long-term activity
- Short-term price movements are often random
- Be prepared for some initial volatility

### 4. Checking Prices Too Frequently
- Daily price checks can cause anxiety and poor decisions
- Set a schedule (perhaps weekly or monthly) to review

### 5. Buying What's "Hot" Right Now
- Trendy stocks often come with inflated prices
- Yesterday's winners aren't necessarily tomorrow's winners

## A Practical Approach for Students

### Consider the "Start Small, Learn Big" Method:
1. Begin with Rs. 2,000-5,000 in a well-known company
2. Document your reasons for choosing the stock
3. Set up a regular schedule to review company news
4. Keep a journal of your thoughts and emotions
5. Add small amounts on a regular basis if possible

## After Buying Your First Stock

### Next Steps:
1. Set up a simple tracking system
2. Create price alerts (but don't obsess over daily movements)
3. Follow company news and quarterly reports
4. Join online communities to learn from others
5. Plan your next investment to start building a diversified portfolio

💡 **Pro Tip**: Your first stock purchase is about learning the process as much as making money. Even if the investment doesn't perform well, the knowledge gained will be valuable for your future investment decisions.`,
              lesson_order: 2
            },
            {
              title: "How Much Money Should You Start With?",
              content: `# How Much Money Should You Start With?

💸 Finding the right amount to begin investing is one of the most common questions for students and new investors.

## The Minimum to Get Started

### Technical Minimums
In India, you can start investing in the stock market with very little money:
- **Stocks**: As low as Rs. 10-20 for some penny stocks
- **Mutual Funds**: SIPs starting at Rs. 100-500 monthly
- **ETFs**: One unit cost (varies, but some under Rs. 50)
- **Demat account**: Many brokers now offer zero balance accounts

### Practical Minimums
While you *can* start with tiny amounts, a more practical minimum would be:
- **For direct stocks**: Rs. 2,000-5,000
- **For mutual funds**: Rs. 500-1,000 monthly SIP
- **For a diversified portfolio**: Rs. 10,000-15,000

## Factors to Consider When Deciding

### 1. Your Financial Situation
Start by answering these questions:
- Do you have an emergency fund? (Create this before investing)
- What are your regular expenses?
- Do you have any high-interest debt? (Pay this off first)
- What is your regular income? (Scholarship, part-time job, allowance)

### 2. Your Investment Goals
Different goals might require different starting amounts:
- Learning experience: Can start very small
- Saving for short-term goals (1-3 years): Moderate amount
- Long-term wealth building: Regular contributions matter more than initial amount

### 3. Transaction Costs
Always consider the costs associated with investing:
- Brokerage fees
- Account maintenance charges
- Transaction taxes (STT, etc.)
- Too small an investment might mean fees eat a large percentage

## Student-Specific Considerations

### Budget Allocation for Student Investors
If you receive Rs. 5,000 monthly (scholarship/allowance/part-time work):

| Allocation | Example |
|------------|---------|
| Emergency Fund | Rs. 1,500 (30%) |
| Education Expenses | Rs. 2,000 (40%) |
| Living Expenses | Rs. 1,000 (20%) |
| Investments | Rs. 500 (10%) |

### Building Up Gradually
A progressive approach for students:

**Month 1-3**: Learn the basics, open accounts, paper trade
**Month 4-6**: Start with Rs. 500 monthly in an index fund
**Month 7-12**: Increase to Rs. 1,000 monthly, consider adding individual stocks
**Year 2+**: Gradually increase as income grows

## Investment Approaches Based on Starting Amount

### Under Rs. 1,000
Best options:
- Index fund SIPs (Rs. 500 monthly)
- Fractional shares (if your broker offers them)
- Micro-investing apps

Focus on:
- Building the habit of regular investing
- Learning the investing process
- Understanding market movements

### Rs. 1,000-5,000
Best options:
- Mutual fund SIPs across 2-3 funds
- 1-2 blue-chip stocks
- ETFs tracking major indices

Focus on:
- Basic diversification
- Regular contributions
- Understanding company financials

### Rs. 5,000-10,000
Best options:
- Portfolio of 3-5 stocks
- Combination of mutual funds and direct stocks
- Different asset classes (mostly equity with some debt)

Focus on:
- Sector diversification
- Risk management
- Portfolio tracking

### Rs. 10,000+
Best options:
- Diversified portfolio of 8-10 stocks
- Strategic asset allocation
- Combination of growth and value investments

Focus on:
- Portfolio construction principles
- Rebalancing strategies
- Long-term planning

## The Psychological Aspect

### Finding Your "Sleep Well" Amount
The ideal starting amount should be:
- Large enough to feel meaningful and motivate learning
- Small enough that temporary losses don't cause stress
- An amount that, if completely lost, wouldn't impact your education or living situation

### The "Coffee Money" Approach
Consider investing money you might otherwise spend on:
- Movie tickets
- Eating out
- Premium app subscriptions
- Impulse purchases

Many students find they can redirect Rs. 500-1,000 monthly this way.

## Common Questions from Student Investors

### "I only have Rs. 500. Should I wait until I have more?"
No! Start now with an index fund SIP. The habit and experience are more valuable than waiting.

### "Should I save up for a larger amount before starting?"
Generally not advisable. Time in the market beats timing the market. Start small and consistent.

### "What if I make a mistake with my first investment?"
That's part of learning! Keep your initial amounts small enough that mistakes become affordable lessons.

### "Should I invest a lump sum or monthly amounts?"
As a student, monthly investments (SIPs) are usually better:
- Reduces timing risk
- Builds discipline
- Matches student cash flow patterns

## Action Steps Based on Your Situation

### If You Have Very Limited Funds:
1. Open a zero-cost demat account
2. Start with a Rs. 100-500 monthly SIP in an index fund
3. Use remaining time to learn and research

### If You Have Some Savings:
1. Allocate 60-70% to a diversified mutual fund
2. Use 20-30% for 1-2 blue-chip stocks you understand
3. Keep 10-20% in cash for future opportunities

### If You Have Regular Income:
1. Determine a fixed percentage (10-20%) for investing
2. Set up automatic transfers on income dates
3. Gradually build a diversified portfolio over time

💡 **Pro Tip**: The amount you start with matters far less than starting early and continuing consistently. A small monthly investment throughout your college years can grow into a significant amount by graduation.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "Smart Investment Strategies",
          description: "Learn about diversification, long-term versus short-term investing, and using news and trends for decision-making.",
          module_order: 4,
          lessons: [
            {
              title: "Diversification and Risk",
              content: `# Diversification and Risk

🛡️ Diversification is one of the most powerful risk management tools available to investors—especially important for students with limited capital.

## Understanding Investment Risk

Risk in investing refers to the possibility that actual returns will differ from expected returns—including the potential to lose some or all of your investment.

### Types of Risk in Stock Investing

#### 1. Company-Specific Risk
- Management changes or mistakes
- Product failures
- Competition
- Financial problems
- Scandals or lawsuits

#### 2. Industry Risk
- Regulatory changes
- Technological disruption
- Changing consumer preferences
- Commodity price fluctuations

#### 3. Market Risk
- Overall market downturns
- Interest rate changes
- Economic recessions
- Political events
- Global crises

#### 4. Inflation Risk
- Purchasing power of returns decreasing over time
- Return rates lower than inflation

## What is Diversification?

Diversification means spreading your investments across different assets to reduce risk without significantly reducing potential returns.

> "Don't put all your eggs in one basket."

This simple principle is powerful because:
- Different investments react differently to the same event
- Losses in one area may be offset by gains in another
- It reduces the impact of any single investment failing

## How to Diversify Your Portfolio

### 1. Across Individual Companies
**Basic level:** Own 10-15 different stocks
**Benefits:** Reduces company-specific risk
**Example:** Instead of investing Rs. 10,000 in one company, invest Rs. 1,000 each in 10 companies.

### 2. Across Sectors/Industries
**Basic level:** Invest in 5-7 different sectors
**Benefits:** Reduces industry risk
**Example:** Include companies from technology, finance, healthcare, consumer goods, and utilities.

### 3. Across Market Caps
**Basic level:** Mix large, mid, and small-cap stocks
**Benefits:** Different growth and stability profiles
**Example:** 60% large-cap, 30% mid-cap, 10% small-cap

### 4. Across Asset Classes
**Basic level:** Include stocks, bonds, and cash equivalents
**Benefits:** Different asset classes perform differently in various economic conditions
**Example:** 70% stocks, 20% bonds, 10% cash (for students with long time horizons)

### 5. Across Geographies
**Basic level:** Include domestic and international investments
**Benefits:** Reduces country-specific risks
**Example:** 70% Indian investments, 30% international exposure

## Diversification for Students with Limited Funds

### Option 1: Use Mutual Funds
- **Index Funds**: One purchase gives exposure to entire markets
- **Diversified Equity Funds**: Professional managers create diversification
- **Fund of Funds**: Invest in multiple mutual funds

**Example Strategy:**
- Nifty 50 Index Fund: Rs. 500/month
- Flexicap Fund: Rs. 500/month
- International Fund: Rs. 500/month

### Option 2: ETF-Based Approach
ETFs (Exchange Traded Funds) trade like stocks but contain diversified holdings

**Example Strategy:**
- Large-cap ETF (e.g., Nifty BeES): 50%
- Mid-cap ETF: 30%
- Gold ETF: 20%

### Option 3: Progressive Diversification
Start with 1-2 positions and add over time as savings increase

**Example Strategy:**
- Month 1-3: Index fund only
- Month 4-6: Add one blue-chip stock
- Month 7-12: Add one different sector stock
- Year 2: Add international exposure
- Continue building positions gradually

## Diversification Mistakes to Avoid

### 1. Over-Diversification
- Owning too many positions (e.g., 50+ individual stocks)
- Makes tracking difficult
- Returns may become average at best
- May indicate lack of conviction

### 2. False Diversification
- Owning multiple companies that move identically
- Example: Five different banks instead of different sectors
- Correlation matters more than number of positions

### 3. Ignoring Costs
- Trading costs from frequent rebalancing
- Fund expenses eroding returns
- Tax implications of diversification changes

### 4. Diversifying Too Quickly
- Not researching each position adequately
- Buying too many positions at once
- Difficulty tracking and understanding portfolio

## How Much Diversification is Enough?

Research suggests that:
- Most company-specific risk is eliminated with 15-20 stocks
- Additional diversification benefits diminish after 25-30 stocks
- Sector diversification requires at least 5-7 industries
- Some international exposure provides substantial benefits

## Understanding the Risk-Return Tradeoff

Most investments follow a basic principle: higher potential returns come with higher risk.

| Type of Investment | Potential Return | Risk Level | Diversification Role |
|-------------------|-----------------|-----------|---------------------|
| Cash/Fixed Deposits | 3-5% | Very Low | Safety, liquidity |
| Government Bonds | 5-8% | Low | Income, stability |
| Large-cap Stocks | 10-12% | Moderate | Core holdings |
| Mid-cap Stocks | 12-15% | Moderate-High | Growth potential |
| Small-cap Stocks | 15%+ | High | Aggressive growth |
| International Stocks | Varies | Moderate-High | Geographic diversification |

## Measuring and Adjusting Risk in Your Portfolio

### 1. Standard Deviation
- Measures volatility (price swings)
- Higher standard deviation = more volatile
- Most mutual fund factsheets include this metric

### 2. Beta
- Measures sensitivity to market movements
- Beta > 1: More volatile than market
- Beta < 1: Less volatile than market

### 3. Drawdown
- Maximum drop from peak to trough
- Shows worst-case scenario historically

## Practical Diversification Tips for Students

### 1. Start Simple
- Begin with index funds or well-diversified mutual funds
- Add individual positions gradually as you learn more
- Focus on quality over quantity

### 2. Rebalance Periodically
- Review portfolio 2-4 times per year
- Rebalance when allocations drift significantly
- Use new contributions to rebalance (to avoid selling)

### 3. Diversify Your Information Sources
- Read various perspectives and opinions
- Follow analysts with different viewpoints
- Consider both bullish and bearish cases

💡 **Pro Tip**: As a student investor, your greatest asset is time. Proper diversification combined with a long time horizon allows you to take appropriate risks while protecting your growing portfolio.`,
              lesson_order: 1
            },
            {
              title: "Long-term vs Short-term Investing",
              content: `# Long-term vs Short-term Investing

⏰ Understanding the differences between long-term and short-term investing approaches is crucial for developing your personal investment strategy.

## Defining Time Horizons

### Short-term Investing
- **Timeframe**: Less than 1-2 years
- **Focus**: Price movements, momentum, timing
- **Goal**: Quick profits, capital preservation

### Medium-term Investing
- **Timeframe**: 2-5 years
- **Focus**: Company growth prospects, valuation
- **Goal**: Balanced growth, specific financial targets

### Long-term Investing
- **Timeframe**: 5+ years, often decades
- **Focus**: Business quality, competitive advantages
- **Goal**: Wealth building, compound growth

## Comparing the Approaches

| Aspect | Short-term | Long-term |
|--------|------------|-----------|
| Research Focus | Charts, momentum, news | Fundamentals, competitive position |
| Time Commitment | High (frequent monitoring) | Low (occasional review) |
| Transaction Costs | Higher (more trades) | Lower (fewer trades) |
| Tax Efficiency | Lower (short-term gains) | Higher (long-term capital gains) |
| Stress Level | Typically higher | Typically lower |
| Skill Required | Technical analysis, timing | Business analysis, patience |

## The Power of Long-term Investing

### Compound Growth
The longer you stay invested, the more powerful compounding becomes:

**Example:**
Rs. 10,000 invested with 12% annual returns:
- After 1 year: Rs. 11,200 (gain: Rs. 1,200)
- After 5 years: Rs. 17,623 (gain: Rs. 7,623)
- After 10 years: Rs. 31,058 (gain: Rs. 21,058)
- After 20 years: Rs. 96,463 (gain: Rs. 86,463)
- After 30 years: Rs. 299,599 (gain: Rs. 289,599)

Notice how the gains accelerate dramatically in later years.

### Riding Out Market Volatility
Historically, markets have always risen over long periods despite short-term drops:

- Probability of positive returns in Indian equity markets:
  - 1-day period: ~52% (barely better than a coin flip)
  - 1-year period: ~70%
  - 5-year period: ~85%
  - 10-year period: ~95%
  - 15+ year period: Nearly 100%

### Lower Costs and Taxes
Long-term investing benefits from:
- Fewer transaction costs
- Lower tax rates on long-term capital gains
- Less time spent monitoring investments

## When Short-term Strategies Make Sense

Short-term approaches can be appropriate for:

### 1. Specific Financial Goals
- Saving for expenses 1-2 years away
- Building a house down payment fund
- Creating an emergency fund

### 2. Tactical Opportunities
- Special situations (mergers, acquisitions)
- Temporary market dislocations
- Sector rotations in economic cycles

### 3. Learning Purposes
- Developing market understanding
- Testing investment theories
- Building investing skills

## Investment Vehicles by Time Horizon

### Short-term (<2 years)
- High-yield savings accounts
- Fixed deposits
- Liquid funds
- Ultra-short duration debt funds
- Arbitrage funds

### Medium-term (2-5 years)
- Balanced mutual funds
- Index funds
- Blue-chip stocks
- Corporate bonds
- Hybrid funds

### Long-term (5+ years)
- Diversified equity portfolios
- Growth-oriented mutual funds
- Quality companies with moats
- Equity-oriented asset allocation

## Student Advantage: The Ultimate Long-term Horizon

As a student, you have a unique advantage: time. Starting in your late teens or early twenties gives you:

- 40+ years of potential compounding
- Ability to take more growth-oriented risks
- Time to learn from investment mistakes
- Opportunity to build habits that last a lifetime

**The Power of Starting Early:**
Two investors, both targeting retirement at 60:
- Student who invests Rs. 5,000/month from age 20-30 (10 years) and then stops
- Professional who invests Rs. 5,000/month from age 30-60 (30 years)

**Result at age 60 (assuming 12% returns):**
- Student: Rs. 1.59 crore (invested only Rs. 6 lakhs)
- Professional: Rs. 1.48 crore (invested Rs. 18 lakhs)

The student invested only 1/3 as much money but ended with more!

## Creating a Balanced Approach

Most successful investors combine elements of both timeframes:

### Core and Satellite Strategy
- **Core portfolio (80%)**: Long-term, buy-and-hold investments
- **Satellite positions (20%)**: Tactical, shorter-term opportunities

### Time-Based Asset Allocation
Allocate investments based on when you'll need the money:
- Short-term needs: Conservative investments
- Medium-term goals: Balanced approach
- Long-term growth: Aggressive growth assets

### Laddering Approach
Creating investments with staggered maturity dates:
- Some money accessible in the short term
- Some invested for medium-term growth
- Some positioned for maximum long-term return

## Common Mistakes to Avoid

### Short-term Investor Mistakes
- Trading too frequently
- Chasing "hot tips" and trends
- Ignoring transaction costs
- Emotional buying and selling
- Getting distracted by market noise

### Long-term Investor Mistakes
- "Set and forget" without periodic review
- Holding onto losing investments too long
- Not rebalancing occasionally
- Ignoring fundamental business changes
- Being too patient with underperforming assets

## How to Develop Your Time Horizon Strategy

### 1. Understand Your Goals
List your financial goals and their timeframes:
- Education expenses: 1-4 years
- First home down payment: 5-7 years
- Retirement: 30+ years

### 2. Match Investments to Timeframes
Align risk levels with when you'll need the money:
- Short-term needs: Safety first
- Long-term growth: Accept volatility for returns

### 3. Create a Mixed Approach
For students, a reasonable mix might be:
- 70% long-term growth investments
- 20% medium-term balanced investments
- 10% short-term safety/opportunity fund

### 4. Document Your Strategy
Write down your approach to refer to during market turbulence.

💡 **Pro Tip for Students**: Take advantage of your long time horizon by focusing primarily on quality growth investments while you're young. As you get older and your financial needs evolve, you can gradually shift to a more balanced approach.`,
              lesson_order: 2
            },
            {
              title: "Using News & Trends for Smart Decisions",
              content: `# Using News & Trends for Smart Decisions

📰 Learning how to interpret financial news and market trends can significantly improve your investment decision-making.

## The Role of News in Investing

News influences markets in several ways:
- Providing new information about companies and economies
- Shaping investor sentiment and emotions
- Creating short-term trading opportunities
- Signaling long-term shifts in industries or markets

### Types of Financial News to Follow

#### 1. Company-Specific News
- Earnings announcements
- Management changes
- New product launches
- Partnerships or acquisitions
- Legal or regulatory issues

#### 2. Industry News
- Sector-wide trends
- Regulatory changes
- Technology disruptions
- Competitive dynamics

#### 3. Macroeconomic News
- GDP growth rates
- Inflation data
- Interest rate decisions
- Employment figures
- Government policies

#### 4. Global Events
- Geopolitical developments
- Trade agreements or tensions
- Natural disasters
- Health crises (like pandemics)

## Distinguishing Signal from Noise

Not all news deserves your attention or reaction:

### What Usually Matters (Signal)
- Significant changes in company fundamentals
- Structural shifts in industries
- Major policy changes affecting multiple sectors
- Sustained economic trends

### What Often Doesn't Matter (Noise)
- Daily market movements
- Short-term price predictions
- Pundit opinions and "hot tips"
- Sensationalized headlines
- Much of social media financial content

## Reliable vs. Unreliable Sources

### Generally Reliable Sources
- Company filings and official statements
- Reputable financial publications
- Research from established institutions
- Data from government and regulatory bodies
- Industry-specific trade publications

### Exercise Caution With
- Social media tips and trends
- Investment "gurus" with extreme predictions
- Platforms with revenue from subscriptions or clicks
- Sources with undisclosed conflicts of interest
- Anonymous online recommendations

## How Different News Affects Different Investments

### Blue-Chip Stocks
- Less affected by short-term news
- More sensitive to interest rate changes
- Impacted by major economic policy shifts

### Growth Stocks
- Highly sensitive to earnings reports
- Significantly affected by interest rate news
- Reactive to growth projection changes

### Value Stocks
- Less volatile to general market news
- More sensitive to turnaround developments
- Affected by sector-specific regulatory changes

### Small-Cap Stocks
- Can be dramatically moved by single news items
- Less analyst coverage means news has bigger impact
- More sensitive to liquidity and funding news

## Reading Beyond the Headlines

### Step 1: Identify the Source
- Who is reporting this information?
- What is their track record for accuracy?
- Do they have any potential biases?

### Step 2: Understand the Context
- Is this an isolated event or part of a pattern?
- How does it compare to historical situations?
- What's the broader context around this news?

### Step 3: Consider Multiple Perspectives
- How are different sources interpreting the same news?
- What are the bull and bear cases?
- What might the consensus be missing?

### Step 4: Evaluate Actual Impact
- How does this affect the company's earnings potential?
- Is this a short-term or long-term development?
- Does it change your investment thesis?

## Using News for Investment Decisions

### 1. Creating a News Filter System
Develop a personal system to filter information:
- Set up Google Alerts for your investments
- Follow specific journalists or analysts known for quality
- Use news aggregators to see diverse perspectives
- Schedule regular times to review news (avoid constant checking)

### 2. Developing a Response Framework
Not all news requires action. Consider this framework:

| News Type | Potential Response |
|-----------|-------------------|
| Minor daily news | No action, just awareness |
| Earnings surprises | Compare to your expectations, evaluate impact on thesis |
| Major company changes | Reassess your investment case |
| Macroeconomic shifts | Consider portfolio allocation adjustments |
| Black swan events | Avoid panic selling, consider buying opportunities |

### 3. Maintaining a News Journal
Keep a simple record of significant news and your thoughts:
- Date and news item
- Your initial reaction
- Decision made (if any)
- Follow-up note (was your reaction correct?)

This creates accountability and helps improve your news interpretation skills.

## Identifying Important Trends

### 1. Secular vs. Cyclical Trends
**Secular trends:** Long-term shifts that continue regardless of economic cycles
- Digital transformation
- Aging demographics
- Climate change adaptation
- Financial inclusion

**Cyclical trends:** Repeat with economic expansions and contractions
- Consumer discretionary spending
- Business capital expenditure
- Commodity prices
- Employment levels

### 2. Trend Identification Tools
- Moving averages (50-day, 200-day)
- Trend lines on price charts
- Industry growth rate comparisons
- Diffusion indices (like PMI)

### 3. Trend Confirmation Signals
Look for multiple confirmations:
- Price action consistent with the trend
- Volume supporting the movement
- Breadth (how many stocks are participating)
- Cross-asset confirmation (related assets moving similarly)

## Common News Interpretation Mistakes

### 1. Recency Bias
Giving too much importance to recent news while ignoring long-term patterns.
**Solution:** Maintain a long-term perspective and historical context.

### 2. Confirmation Bias
Seeking news that confirms existing beliefs while ignoring contradictory information.
**Solution:** Deliberately seek opposing viewpoints.

### 3. Narrative Fallacy
Creating simple stories to explain complex market movements.
**Solution:** Accept that many factors influence markets simultaneously.

### 4. Action Bias
Feeling compelled to trade on news when doing nothing might be better.
**Solution:** Have pre-defined criteria for when news justifies action.

## Student-Specific News Strategy

As a student investor with limited time and resources:

### 1. Focus on Quality Over Quantity
- 15 minutes of high-quality financial news is better than hours of noise
- One thorough earnings report review beats skimming dozens

### 2. Use Technology Wisely
- Set up alerts for only your most important holdings
- Use news aggregators that filter for significance
- Consider AI summaries of lengthy financial reports

### 3. Develop Academic Discipline
- Apply critical thinking skills from your studies
- Question assertions and look for evidence
- Practice patience and long-term thinking

### 4. Start with the Macro Picture
- Understand the current economic environment
- Know where we are in the business cycle
- Then focus on industries, then individual companies

💡 **Pro Tip**: Create a simple weekly ritual—perhaps Sunday evening—to review the past week's significant news and prepare for the week ahead. This disciplined approach prevents daily news from becoming overwhelming while keeping you informed enough to make good decisions.`,
              lesson_order: 3
            }
          ]
        }
      ]
    };
    
    console.log("Starting to create courses...");
    
    // Create AI Tools course if it doesn't exist
    const aiToolsExists = await courseExists("AI Tools for Students");
    if (!aiToolsExists) {
      console.log("Creating AI Tools for Students course...");
      await createCourse(aiToolsCourse);
    }
    
    // Create Stock Market course if it doesn't exist
    const stockMarketExists = await courseExists("Introduction to Stock Investment");
    if (!stockMarketExists) {
      console.log("Creating Introduction to Stock Investment course...");
      await createCourse(stockMarketCourse);
    }
    
    console.log("Course initialization complete!");
  } catch (error) {
    console.error("Error in initializeAppData:", error);
  }
};
