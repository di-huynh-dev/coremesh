import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content/questions')

export function getQuestionBySlug(category: string, slug: string) {
    const fullPath = path.join(contentDirectory, category, `${slug}.mdx`)

    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const { data, content } = matter(fileContents)

    return {
        frontmatter: data,
        content,
    }
}

export interface SimpleQuestion {
    category: string
    slug: string
}

export interface QuestionMetadata {
    slug: string
    category: string
    title: string
    description: string
    difficulty: string
    tags: string[]
    readingTime: number
    isNew?: boolean
}

export function getAllQuestions(): SimpleQuestion[] {
    const categories = fs.readdirSync(contentDirectory)

    const questions: SimpleQuestion[] = []

    for (const category of categories) {
        const categoryPath = path.join(contentDirectory, category)

        const files = fs.readdirSync(categoryPath)

        for (const file of files) {
            const slug = file.replace('.mdx', '')

            questions.push({
                category,
                slug,
            })
        }
    }

    return questions
}

export function getQuestionsByCategory(category: string): QuestionMetadata[] {
    const categoryPath = path.join(contentDirectory, category)
    if (!fs.existsSync(categoryPath)) {
        return []
    }

    const files = fs.readdirSync(categoryPath)

    return files.map((file) => {
        const slug = file.replace('.mdx', '')

        const fullPath = path.join(categoryPath, file)

        const fileContents = fs.readFileSync(fullPath, 'utf8')

        const { data } = matter(fileContents)

        return {
            slug,
            category,
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'Medium',
            tags: data.tags || [],
            readingTime: data.readingTime || 5,
            isNew: data.new || data.isNew || category.toLowerCase() === 'behavioral',
        }
    })
}

export function getAllQuestionsWithMetadata(): QuestionMetadata[] {
    const categories = fs.readdirSync(contentDirectory)
    const allQuestions: QuestionMetadata[] = []

    for (const category of categories) {
        const categoryPath = path.join(contentDirectory, category)
        if (!fs.statSync(categoryPath).isDirectory()) continue

        const files = fs.readdirSync(categoryPath)
        for (const file of files) {
            if (!file.endsWith('.mdx')) continue
            const slug = file.replace('.mdx', '')
            const fullPath = path.join(categoryPath, file)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data } = matter(fileContents)

            allQuestions.push({
                slug,
                category,
                title: data.title || '',
                description: data.description || '',
                difficulty: data.difficulty || 'Medium',
                tags: data.tags || [],
                readingTime: data.readingTime || 5,
                isNew: data.new || data.isNew || category.toLowerCase() === 'behavioral',
            })
        }
    }

    return allQuestions
}

export interface TocItem {
    id: string
    text: string
    level: 2 | 3
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric, non-space, non-hyphen
        .replace(/\s+/g, '-')         // replace spaces with hyphens
        .replace(/-+/g, '-')         // collapse multiple hyphens
}

export function extractHeadings(content: string): TocItem[] {
    const headings: TocItem[] = []
    const lines = content.split('\n')
    let inCodeBlock = false

    for (const line of lines) {
        const trimmed = line.trim()
        
        // Toggle code block state
        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock
            continue
        }

        if (inCodeBlock) continue

        // Match ## or ### headings
        const match = trimmed.match(/^(##|###)\s+(.+)$/)
        if (match) {
            const level = match[1].length === 2 ? 2 : 3
            const text = match[2].trim()

            // Clean up basic markdown formatting in headers (bold, italics, inline code backticks, links)
            const cleanText = text
                .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
                .replace(/\*([^*]+)\*/g, '$1')     // remove italic
                .replace(/`([^`]+)`/g, '$1')       // remove inline code backticks
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links but keep text

            const id = slugify(cleanText)
            headings.push({ id, text: cleanText, level })
        }
    }

    return headings
}

export function getQuestionCountByCategory(category: string): number {
    const categoryPath = path.join(contentDirectory, category)
    if (!fs.existsSync(categoryPath)) {
        return 0
    }
    try {
        const files = fs.readdirSync(categoryPath)
        return files.filter((file) => file.endsWith('.mdx')).length
    } catch {
        return 0
    }
}

const guidesDirectory = path.join(process.cwd(), 'content/guides')

export function getGuideBySlug(category: string, slug: string) {
    const fullPath = path.join(guidesDirectory, category, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
        frontmatter: data,
        content,
    }
}

export function getAllGuides() {
    if (!fs.existsSync(guidesDirectory)) return []
    const categories = fs.readdirSync(guidesDirectory)
    const guides = []

    for (const category of categories) {
        const categoryPath = path.join(guidesDirectory, category)
        if (!fs.statSync(categoryPath).isDirectory()) continue

        const files = fs.readdirSync(categoryPath)
        for (const file of files) {
            if (!file.endsWith('.mdx')) continue
            const slug = file.replace('.mdx', '')
            guides.push({
                category,
                slug,
            })
        }
    }

    return guides
}

export function getGuidesByCategory(category: string) {
    const categoryPath = path.join(guidesDirectory, category)
    if (!fs.existsSync(categoryPath)) {
        return []
    }

    const files = fs.readdirSync(categoryPath)
    return files
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
            const slug = file.replace('.mdx', '')
            const fullPath = path.join(categoryPath, file)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data } = matter(fileContents)

            return {
                slug,
                category,
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                tags: data.tags || [],
                readingTime: data.readingTime,
                featured: data.featured || false,
                isNew: data.isNew || data.new || false,
            }
        })
}

export function getAllGuidesWithMetadata() {
    if (!fs.existsSync(guidesDirectory)) return []
    const categories = fs.readdirSync(guidesDirectory)
    const allGuides = []

    for (const category of categories) {
        const categoryPath = path.join(guidesDirectory, category)
        if (!fs.statSync(categoryPath).isDirectory()) continue

        const files = fs.readdirSync(categoryPath)
        for (const file of files) {
            if (!file.endsWith('.mdx')) continue
            const slug = file.replace('.mdx', '')
            const fullPath = path.join(categoryPath, file)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data } = matter(fileContents)

            allGuides.push({
                slug,
                category,
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                tags: data.tags || [],
                readingTime: data.readingTime,
                featured: data.featured || false,
                isNew: data.isNew || data.new || false,
            })
        }
    }

    return allGuides
}

export function getGuideCountByCategory(category: string): number {
    const categoryPath = path.join(guidesDirectory, category)
    if (!fs.existsSync(categoryPath)) {
        return 0
    }
    try {
        const files = fs.readdirSync(categoryPath)
        return files.filter((file) => file.endsWith('.mdx')).length
    } catch {
        return 0
    }
}