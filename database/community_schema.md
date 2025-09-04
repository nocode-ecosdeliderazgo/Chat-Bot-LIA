 -- ===== ESQUEMA DE BASE DE DATOS PARA ÁREA DE COMUNIDAD =====
-- Sistema de preguntas y respuestas tipo Udemy para Chat-Online

-- Tabla de preguntas de la comunidad
CREATE TABLE public.community_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID, -- Referencia al curso actual
    module_id VARCHAR(50), -- Módulo específico del curso
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array de tags para categorización
    votes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de respuestas a preguntas
CREATE TABLE public.community_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_instructor_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de comentarios (para preguntas y respuestas)
CREATE TABLE public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_type VARCHAR(20) NOT NULL, -- 'question' o 'answer'
    parent_id UUID NOT NULL, -- ID de la pregunta o respuesta
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de votos (likes/dislikes)
CREATE TABLE public.community_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- 'question', 'answer', 'comment'
    target_id UUID NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'upvote', 'downvote'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Tabla de marcadores/favoritos
CREATE TABLE public.community_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.community_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Índices para optimización
CREATE INDEX idx_community_questions_course_id ON public.community_questions(course_id);
CREATE INDEX idx_community_questions_user_id ON public.community_questions(user_id);
CREATE INDEX idx_community_questions_created_at ON public.community_questions(created_at DESC);
CREATE INDEX idx_community_questions_votes ON public.community_questions(votes_count DESC);

CREATE INDEX idx_community_answers_question_id ON public.community_answers(question_id);
CREATE INDEX idx_community_answers_user_id ON public.community_answers(user_id);
CREATE INDEX idx_community_answers_votes ON public.community_answers(votes_count DESC);

CREATE INDEX idx_community_comments_parent ON public.community_comments(parent_type, parent_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments(user_id);

CREATE INDEX idx_community_votes_target ON public.community_votes(target_type, target_id);
CREATE INDEX idx_community_votes_user_id ON public.community_votes(user_id);

-- Triggers para actualizar contadores automáticamente
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador de respuestas
        IF NEW.question_id IS NOT NULL THEN
            UPDATE public.community_questions 
            SET answers_count = answers_count + 1,
                updated_at = NOW()
            WHERE id = NEW.question_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador de respuestas
        IF OLD.question_id IS NOT NULL THEN
            UPDATE public.community_questions 
            SET answers_count = answers_count - 1,
                updated_at = NOW()
            WHERE id = OLD.question_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT OR DELETE ON public.community_answers
    FOR EACH ROW EXECUTE FUNCTION update_question_stats();

-- Función para actualizar contadores de votos
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador según el tipo de voto
        IF NEW.vote_type = 'upvote' THEN
            IF NEW.target_type = 'question' THEN
                UPDATE public.community_questions SET votes_count = votes_count + 1 WHERE id = NEW.target_id;
            ELSIF NEW.target_type = 'answer' THEN
                UPDATE public.community_answers SET votes_count = votes_count + 1 WHERE id = NEW.target_id;
            ELSIF NEW.target_type = 'comment' THEN
                UPDATE public.community_comments SET votes_count = votes_count + 1 WHERE id = NEW.target_id;
            END IF;
        ELSIF NEW.vote_type = 'downvote' THEN
            IF NEW.target_type = 'question' THEN
                UPDATE public.community_questions SET votes_count = votes_count - 1 WHERE id = NEW.target_id;
            ELSIF NEW.target_type = 'answer' THEN
                UPDATE public.community_answers SET votes_count = votes_count - 1 WHERE id = NEW.target_id;
            ELSIF NEW.target_type = 'comment' THEN
                UPDATE public.community_comments SET votes_count = votes_count - 1 WHERE id = NEW.target_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Revertir el voto
        IF OLD.vote_type = 'upvote' THEN
            IF OLD.target_type = 'question' THEN
                UPDATE public.community_questions SET votes_count = votes_count - 1 WHERE id = OLD.target_id;
            ELSIF OLD.target_type = 'answer' THEN
                UPDATE public.community_answers SET votes_count = votes_count - 1 WHERE id = OLD.target_id;
            ELSIF OLD.target_type = 'comment' THEN
                UPDATE public.community_comments SET votes_count = votes_count - 1 WHERE id = OLD.target_id;
            END IF;
        ELSIF OLD.vote_type = 'downvote' THEN
            IF OLD.target_type = 'question' THEN
                UPDATE public.community_questions SET votes_count = votes_count + 1 WHERE id = OLD.target_id;
            ELSIF OLD.target_type = 'answer' THEN
                UPDATE public.community_answers SET votes_count = votes_count + 1 WHERE id = OLD.target_id;
            ELSIF OLD.target_type = 'comment' THEN
                UPDATE public.community_comments SET votes_count = votes_count + 1 WHERE id = OLD.target_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR DELETE ON public.community_votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();
