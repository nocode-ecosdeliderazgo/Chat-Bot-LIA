/**
 * Datos hardcodeados del curso "Aprende y Aplica IA"
 * Este archivo contiene toda la información del curso estructurada para el agente de IA
 */

const COURSE_DATA = {
    info: {
        title: "Aprende y Aplica IA",
        description: "Curso completo de Inteligencia Artificial desde fundamentos hasta aplicaciones prácticas",
        duration: "8 sesiones",
        level: "Principiante a Intermedio",
        modalidad: "Online"
    },

    sessions: [
        {
            id: 1,
            title: "Introducción a la Inteligencia Artificial",
            duration: "90 minutos",
            objectives: [
                "Comprender qué es la Inteligencia Artificial",
                "Conocer la historia y evolución de la IA",
                "Identificar tipos de IA: débil, fuerte y superinteligencia",
                "Distinguir entre IA, Machine Learning y Deep Learning"
            ],
            content: {
                concepts: [
                    {
                        term: "Inteligencia Artificial",
                        definition: "Capacidad de las máquinas para realizar tareas que tradicionalmente requieren inteligencia humana"
                    },
                    {
                        term: "Machine Learning",
                        definition: "Subcampo de la IA que permite a las máquinas aprender sin ser explícitamente programadas"
                    },
                    {
                        term: "Deep Learning",
                        definition: "Técnica de ML basada en redes neuronales artificiales con múltiples capas"
                    },
                    {
                        term: "Algoritmo",
                        definition: "Conjunto de reglas o instrucciones para resolver un problema específico"
                    }
                ],
                topics: [
                    "Historia de la IA (1950-presente)",
                    "Test de Turing",
                    "Tipos de IA: reactiva, memoria limitada, teoría de la mente, autoconciencia",
                    "Aplicaciones actuales de IA en diferentes industrias"
                ]
            },
            activities: [
                {
                    title: "Identificación de IA en el día a día",
                    description: "Listar 10 ejemplos de IA que usas diariamente",
                    type: "ejercicio_practico"
                },
                {
                    title: "Línea de tiempo de la IA",
                    description: "Crear una línea de tiempo con los hitos más importantes de la IA",
                    type: "investigacion"
                }
            ],
            faq: [
                {
                    question: "¿Cuál es la diferencia entre IA y Machine Learning?",
                    answer: "La IA es el campo general, mientras que ML es una técnica específica dentro de la IA que permite a las máquinas aprender de datos."
                },
                {
                    question: "¿La IA reemplazará a los humanos?",
                    answer: "La IA actual está diseñada para complementar y potenciar las capacidades humanas, no para reemplazarlas completamente."
                }
            ]
        },
        {
            id: 2,
            title: "Fundamentos de Machine Learning",
            duration: "120 minutos",
            objectives: [
                "Entender los tipos de aprendizaje automático",
                "Conocer algoritmos básicos de ML",
                "Comprender el proceso de entrenamiento de modelos",
                "Identificar casos de uso para cada tipo de ML"
            ],
            content: {
                concepts: [
                    {
                        term: "Aprendizaje Supervisado",
                        definition: "Tipo de ML donde el modelo aprende con datos etiquetados"
                    },
                    {
                        term: "Aprendizaje No Supervisado",
                        definition: "ML que encuentra patrones en datos sin etiquetas"
                    },
                    {
                        term: "Aprendizaje por Refuerzo",
                        definition: "El modelo aprende mediante recompensas y castigos"
                    },
                    {
                        term: "Overfitting",
                        definition: "Cuando un modelo se adapta demasiado a los datos de entrenamiento"
                    },
                    {
                        term: "Dataset",
                        definition: "Conjunto de datos usado para entrenar un modelo de ML"
                    }
                ],
                topics: [
                    "Algoritmos de clasificación: Naive Bayes, SVM, Random Forest",
                    "Algoritmos de regresión: Lineal, Polinomial",
                    "Clustering: K-means, Clustering jerárquico",
                    "Validación cruzada y métricas de evaluación"
                ]
            },
            activities: [
                {
                    title: "Clasificación de emails spam",
                    description: "Implementar un clasificador básico usando algoritmo Naive Bayes",
                    type: "proyecto_practico"
                },
                {
                    title: "Análisis exploratorio de datos",
                    description: "Explorar un dataset y identificar patrones usando técnicas de clustering",
                    type: "analisis"
                }
            ],
            faq: [
                {
                    question: "¿Cuándo usar aprendizaje supervisado vs no supervisado?",
                    answer: "Supervisado cuando tienes datos etiquetados y quieres predecir. No supervisado cuando buscas patrones ocultos en datos sin etiquetas."
                },
                {
                    question: "¿Cómo evitar el overfitting?",
                    answer: "Usa validación cruzada, regularización, más datos de entrenamiento y técnicas como dropout en redes neuronales."
                }
            ]
        },
        {
            id: 3,
            title: "Redes Neuronales y Deep Learning",
            duration: "150 minutos",
            objectives: [
                "Comprender la estructura de una red neuronal",
                "Conocer tipos de redes neuronales",
                "Entender el proceso de backpropagation",
                "Aplicar redes neuronales a problemas reales"
            ],
            content: {
                concepts: [
                    {
                        term: "Neurona Artificial",
                        definition: "Unidad básica de procesamiento que recibe entradas, las procesa y produce una salida"
                    },
                    {
                        term: "Backpropagation",
                        definition: "Algoritmo para entrenar redes neuronales ajustando pesos basándose en el error"
                    },
                    {
                        term: "Función de Activación",
                        definition: "Función que determina si una neurona debe activarse o no"
                    },
                    {
                        term: "CNN",
                        definition: "Red Neuronal Convolucional, especializada en procesamiento de imágenes"
                    },
                    {
                        term: "RNN",
                        definition: "Red Neuronal Recurrente, especializada en secuencias de datos"
                    }
                ],
                topics: [
                    "Perceptrón y perceptrón multicapa",
                    "Funciones de activación: ReLU, Sigmoid, Tanh",
                    "Arquitecturas: Feedforward, CNN, RNN, LSTM",
                    "Frameworks: TensorFlow, PyTorch, Keras"
                ]
            },
            activities: [
                {
                    title: "Reconocimiento de dígitos manuscritos",
                    description: "Crear una CNN para clasificar dígitos del dataset MNIST",
                    type: "proyecto_practico"
                },
                {
                    title: "Predicción de series temporales",
                    description: "Usar LSTM para predecir precios de acciones",
                    type: "ejercicio_avanzado"
                }
            ],
            faq: [
                {
                    question: "¿Cuál es la diferencia entre CNN y RNN?",
                    answer: "CNN son ideales para datos espaciales como imágenes. RNN son mejores para datos secuenciales como texto o series temporales."
                },
                {
                    question: "¿Por qué usar ReLU como función de activación?",
                    answer: "ReLU es computacionalmente eficiente, evita el problema del gradiente que desaparece y funciona bien en la práctica."
                }
            ]
        },
        {
            id: 4,
            title: "Procesamiento de Lenguaje Natural (NLP)",
            duration: "135 minutos",
            objectives: [
                "Entender las bases del procesamiento de texto",
                "Conocer técnicas de tokenización y normalización",
                "Implementar modelos de clasificación de texto",
                "Comprender modelos de lenguaje modernos"
            ],
            content: {
                concepts: [
                    {
                        term: "Token",
                        definition: "Unidad básica de texto procesada por un modelo (palabra, subpalabra o carácter)"
                    },
                    {
                        term: "Tokenización",
                        definition: "Proceso de dividir texto en tokens más pequeños"
                    },
                    {
                        term: "Word Embedding",
                        definition: "Representación vectorial de palabras que captura relaciones semánticas"
                    },
                    {
                        term: "Transformer",
                        definition: "Arquitectura de red neuronal basada en mecanismos de atención"
                    },
                    {
                        term: "LLM",
                        definition: "Large Language Model - Modelo de lenguaje entrenado con grandes cantidades de texto"
                    }
                ],
                topics: [
                    "Preprocesamiento de texto: limpieza, normalización",
                    "Modelos clásicos: Bag of Words, TF-IDF",
                    "Word2Vec, GloVe, FastText",
                    "Arquitectura Transformer y modelos BERT, GPT"
                ]
            },
            activities: [
                {
                    title: "Análisis de sentimientos en redes sociales",
                    description: "Clasificar tweets como positivos, negativos o neutrales",
                    type: "proyecto_practico"
                },
                {
                    title: "Chatbot básico",
                    description: "Crear un chatbot simple usando técnicas de NLP",
                    type: "ejercicio_practico"
                }
            ],
            faq: [
                {
                    question: "¿Qué es un prompt en NLP?",
                    answer: "Un prompt es la entrada de texto que se le da a un modelo de lenguaje para generar una respuesta específica."
                },
                {
                    question: "¿Cómo funcionan los modelos como GPT?",
                    answer: "GPT usa arquitectura Transformer para predecir la siguiente palabra en una secuencia, entrenado con enormes cantidades de texto."
                }
            ]
        },
        {
            id: 5,
            title: "Visión por Computadora",
            duration: "120 minutos",
            objectives: [
                "Comprender conceptos básicos de procesamiento de imágenes",
                "Implementar técnicas de detección y clasificación",
                "Conocer aplicaciones de visión por computadora",
                "Usar modelos pre-entrenados"
            ],
            content: {
                concepts: [
                    {
                        term: "Pixel",
                        definition: "Unidad más pequeña de una imagen digital, con valores de color RGB"
                    },
                    {
                        term: "Convolución",
                        definition: "Operación matemática que aplica filtros para extraer características de imágenes"
                    },
                    {
                        term: "Transfer Learning",
                        definition: "Técnica que usa modelos pre-entrenados para nuevas tareas similares"
                    },
                    {
                        term: "Data Augmentation",
                        definition: "Técnicas para aumentar el dataset mediante transformaciones de imágenes"
                    },
                    {
                        term: "Object Detection",
                        definition: "Tarea de localizar y clasificar múltiples objetos en una imagen"
                    }
                ],
                topics: [
                    "Filtros y convoluciones en imágenes",
                    "Pooling y reducción de dimensionalidad",
                    "Arquitecturas CNN: LeNet, AlexNet, ResNet",
                    "Modelos de detección: YOLO, R-CNN"
                ]
            },
            activities: [
                {
                    title: "Clasificador de imágenes médicas",
                    description: "Entrenar un modelo para detectar neumonía en radiografías",
                    type: "proyecto_practico"
                },
                {
                    title: "Sistema de reconocimiento facial",
                    description: "Implementar detección y reconocimiento de rostros",
                    type: "ejercicio_avanzado"
                }
            ],
            faq: [
                {
                    question: "¿Qué ventajas tiene el transfer learning?",
                    answer: "Permite entrenar modelos eficaces con menos datos y tiempo, aprovechando conocimiento de modelos ya entrenados."
                },
                {
                    question: "¿Cómo mejorar el rendimiento de un modelo de visión?",
                    answer: "Usar data augmentation, transfer learning, ajustar hiperparámetros y obtener más datos de calidad."
                }
            ]
        },
        {
            id: 6,
            title: "IA Generativa y Modelos de Lenguaje",
            duration: "150 minutos",
            objectives: [
                "Entender qué es la IA generativa",
                "Conocer diferentes tipos de modelos generativos",
                "Dominar técnicas de prompt engineering",
                "Aplicar IA generativa a casos de uso reales"
            ],
            content: {
                concepts: [
                    {
                        term: "IA Generativa",
                        definition: "IA capaz de crear contenido nuevo como texto, imágenes, audio o código"
                    },
                    {
                        term: "Prompt Engineering",
                        definition: "Arte de diseñar prompts efectivos para obtener mejores resultados de modelos de IA"
                    },
                    {
                        term: "Fine-tuning",
                        definition: "Proceso de especializar un modelo pre-entrenado para una tarea específica"
                    },
                    {
                        term: "Zero-shot",
                        definition: "Capacidad de un modelo de realizar tareas sin ejemplos específicos de entrenamiento"
                    },
                    {
                        term: "Few-shot",
                        definition: "Aprendizaje con pocos ejemplos para realizar una nueva tarea"
                    }
                ],
                topics: [
                    "Modelos GPT: GPT-3, GPT-4, ChatGPT",
                    "Modelos de imagen: DALL-E, Midjourney, Stable Diffusion",
                    "Técnicas de prompting: chain-of-thought, role prompting",
                    "Aplicaciones: código, contenido, arte, música"
                ]
            },
            activities: [
                {
                    title: "Asistente de escritura inteligente",
                    description: "Crear un sistema que ayude a escribir contenido usando prompts optimizados",
                    type: "proyecto_practico"
                },
                {
                    title: "Generador de arte con IA",
                    description: "Usar modelos de difusión para crear arte personalizado",
                    type: "ejercicio_creativo"
                }
            ],
            faq: [
                {
                    question: "¿Cómo escribir prompts efectivos?",
                    answer: "Sé específico, da contexto, usa ejemplos, estructura tu request claramente y experimenta con diferentes enfoques."
                },
                {
                    question: "¿Qué es temperature en modelos generativos?",
                    answer: "Parámetro que controla la creatividad/aleatoriedad. Valores bajos = más conservador, valores altos = más creativo."
                }
            ]
        },
        {
            id: 7,
            title: "Ética y Responsabilidad en IA",
            duration: "90 minutos",
            objectives: [
                "Identificar dilemas éticos en IA",
                "Comprender el concepto de sesgo algorítmico",
                "Conocer principios de IA responsable",
                "Evaluar impacto social de la IA"
            ],
            content: {
                concepts: [
                    {
                        term: "Sesgo Algorítmico",
                        definition: "Prejuicios sistemáticos en sistemas de IA que resultan en tratamiento injusto"
                    },
                    {
                        term: "Fairness",
                        definition: "Principio de justicia y equidad en sistemas de IA"
                    },
                    {
                        term: "Explicabilidad",
                        definition: "Capacidad de entender y explicar cómo un modelo de IA toma decisiones"
                    },
                    {
                        term: "Privacidad Diferencial",
                        definition: "Técnica para proteger datos individuales mientras se permite análisis agregado"
                    },
                    {
                        term: "AI Alignment",
                        definition: "Asegurar que los objetivos de la IA estén alineados con valores humanos"
                    }
                ],
                topics: [
                    "Casos de sesgo en algoritmos de contratación, justicia penal",
                    "Transparencia y accountability en IA",
                    "Impacto laboral de la automatización",
                    "Regulación y gobernanza de IA"
                ]
            },
            activities: [
                {
                    title: "Auditoría de sesgo en algoritmos",
                    description: "Analizar un algoritmo de clasificación para detectar sesgos potenciales",
                    type: "ejercicio_analisis"
                },
                {
                    title: "Debate sobre IA y empleo",
                    description: "Discutir pros y contras del impacto de IA en el mercado laboral",
                    type: "debate"
                }
            ],
            faq: [
                {
                    question: "¿Cómo puede ser sesgada la IA?",
                    answer: "A través de datos de entrenamiento sesgados, algoritmos mal diseñados, o interpretación incorrecta de resultados."
                },
                {
                    question: "¿Qué es IA explicable?",
                    answer: "IA cuyos procesos de decisión pueden ser entendidos y explicados por humanos, especialmente importante en áreas críticas."
                }
            ]
        },
        {
            id: 8,
            title: "Implementación y Despliegue de Modelos de IA",
            duration: "180 minutos",
            objectives: [
                "Conocer el ciclo de vida de un proyecto de IA",
                "Implementar modelos en producción",
                "Monitorear y mantener sistemas de IA",
                "Planificar proyectos de IA exitosos"
            ],
            content: {
                concepts: [
                    {
                        term: "MLOps",
                        definition: "Conjunto de prácticas para automatizar y mejorar el proceso de ML en producción"
                    },
                    {
                        term: "Model Drift",
                        definition: "Degradación del rendimiento del modelo debido a cambios en los datos"
                    },
                    {
                        term: "API",
                        definition: "Interfaz que permite que diferentes sistemas se comuniquen entre sí"
                    },
                    {
                        term: "Containerización",
                        definition: "Empaquetar aplicaciones y sus dependencias en contenedores portables"
                    },
                    {
                        term: "A/B Testing",
                        definition: "Método para comparar dos versiones de un modelo para determinar cuál funciona mejor"
                    }
                ],
                topics: [
                    "Pipeline de datos y entrenamiento",
                    "Despliegue en cloud: AWS, Azure, GCP",
                    "Monitoreo y logging de modelos",
                    "Versionado de modelos y reproducibilidad"
                ]
            },
            activities: [
                {
                    title: "Despliegue de modelo de ML",
                    description: "Desplegar un modelo entrenado como API web usando Flask/FastAPI",
                    type: "proyecto_final"
                },
                {
                    title: "Dashboard de monitoreo",
                    description: "Crear un dashboard para monitorear el rendimiento de modelos en producción",
                    type: "proyecto_practico"
                }
            ],
            faq: [
                {
                    question: "¿Qué considerar al desplegar un modelo en producción?",
                    answer: "Escalabilidad, latencia, seguridad, monitoreo, versionado y plan de rollback en caso de problemas."
                },
                {
                    question: "¿Cómo detectar model drift?",
                    answer: "Monitoreando métricas de rendimiento continuamente y comparando distribuciones de datos de entrada con datos de entrenamiento."
                }
            ]
        }
    ],

    glossary: [
        {
            term: "Inteligencia Artificial",
            definition: "Campo de la informática que se enfoca en crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana",
            category: "fundamental"
        },
        {
            term: "Machine Learning",
            definition: "Subcampo de la IA que permite a las máquinas aprender y mejorar automáticamente a partir de datos sin ser explícitamente programadas",
            category: "fundamental"
        },
        {
            term: "Deep Learning",
            definition: "Técnica de machine learning basada en redes neuronales artificiales con múltiples capas (profundas)",
            category: "fundamental"
        },
        {
            term: "Algoritmo",
            definition: "Conjunto de reglas o instrucciones paso a paso para resolver un problema o realizar una tarea específica",
            category: "fundamental"
        },
        {
            term: "Datos de Entrenamiento",
            definition: "Conjunto de datos utilizado para enseñar a un modelo de machine learning a hacer predicciones o clasificaciones",
            category: "data"
        },
        {
            term: "Overfitting",
            definition: "Fenómeno donde un modelo se adapta excesivamente a los datos de entrenamiento, perdiendo capacidad de generalización",
            category: "problemas"
        },
        {
            term: "Underfitting",
            definition: "Cuando un modelo es demasiado simple para capturar los patrones subyacentes en los datos",
            category: "problemas"
        },
        {
            term: "Validación Cruzada",
            definition: "Técnica para evaluar el rendimiento de un modelo dividiendo los datos en múltiples subconjuntos",
            category: "evaluacion"
        },
        {
            term: "Precisión",
            definition: "Proporción de predicciones positivas que fueron correctas (TP / (TP + FP))",
            category: "metricas"
        },
        {
            term: "Recall",
            definition: "Proporción de casos positivos reales que fueron correctamente identificados (TP / (TP + FN))",
            category: "metricas"
        },
        {
            term: "F1-Score",
            definition: "Media armónica entre precisión y recall, útil cuando hay desbalance en las clases",
            category: "metricas"
        },
        {
            term: "Gradient Descent",
            definition: "Algoritmo de optimización usado para minimizar funciones de costo ajustando parámetros",
            category: "algoritmos"
        },
        {
            term: "Backpropagation",
            definition: "Algoritmo para entrenar redes neuronales calculando gradientes y ajustando pesos hacia atrás",
            category: "algoritmos"
        },
        {
            term: "Función de Activación",
            definition: "Función que determina la salida de una neurona basándose en sus entradas",
            category: "redes_neuronales"
        },
        {
            term: "Epoch",
            definition: "Una pasada completa a través de todo el conjunto de datos de entrenamiento",
            category: "entrenamiento"
        },
        {
            term: "Batch Size",
            definition: "Número de muestras procesadas antes de actualizar los parámetros del modelo",
            category: "entrenamiento"
        },
        {
            term: "Learning Rate",
            definition: "Hiperparámetro que controla qué tan grandes son los pasos durante la optimización",
            category: "hiperparametros"
        },
        {
            term: "Feature Engineering",
            definition: "Proceso de seleccionar, modificar o crear características relevantes para el modelo",
            category: "preprocessing"
        },
        {
            term: "One-Hot Encoding",
            definition: "Técnica para convertir variables categóricas en vectores binarios",
            category: "preprocessing"
        },
        {
            term: "Normalización",
            definition: "Proceso de escalar los datos para que tengan un rango específico, típicamente [0,1]",
            category: "preprocessing"
        },
        {
            term: "Estandarización",
            definition: "Transformar datos para que tengan media 0 y desviación estándar 1",
            category: "preprocessing"
        },
        {
            term: "Clustering",
            definition: "Técnica de aprendizaje no supervisado que agrupa datos similares",
            category: "unsupervised"
        },
        {
            term: "K-means",
            definition: "Algoritmo de clustering que divide datos en k grupos basándose en similitud",
            category: "algoritmos"
        },
        {
            term: "Random Forest",
            definition: "Algoritmo de ensemble que combina múltiples árboles de decisión",
            category: "algoritmos"
        },
        {
            term: "Support Vector Machine",
            definition: "Algoritmo que encuentra el hiperplano óptimo para separar clases",
            category: "algoritmos"
        },
        {
            term: "Naive Bayes",
            definition: "Algoritmo de clasificación basado en el teorema de Bayes con independencia condicional",
            category: "algoritmos"
        },
        {
            term: "CNN",
            definition: "Red Neuronal Convolucional, especializada en procesamiento de imágenes",
            category: "arquitecturas"
        },
        {
            term: "RNN",
            definition: "Red Neuronal Recurrente, diseñada para procesar secuencias de datos",
            category: "arquitecturas"
        },
        {
            term: "LSTM",
            definition: "Long Short-Term Memory, tipo de RNN que puede recordar información por largos períodos",
            category: "arquitecturas"
        },
        {
            term: "Transformer",
            definition: "Arquitectura de red neuronal basada en mecanismos de atención",
            category: "arquitecturas"
        },
        {
            term: "Attention Mechanism",
            definition: "Técnica que permite al modelo enfocarse en partes relevantes de la entrada",
            category: "tecnicas"
        },
        {
            term: "Transfer Learning",
            definition: "Técnica que reutiliza un modelo pre-entrenado para una nueva tarea relacionada",
            category: "tecnicas"
        },
        {
            term: "Fine-tuning",
            definition: "Proceso de adaptar un modelo pre-entrenado a una tarea específica",
            category: "tecnicas"
        },
        {
            term: "Data Augmentation",
            definition: "Técnicas para aumentar artificialmente el tamaño del dataset",
            category: "tecnicas"
        },
        {
            term: "Dropout",
            definition: "Técnica de regularización que desactiva aleatoriamente algunas neuronas durante el entrenamiento",
            category: "regularizacion"
        },
        {
            term: "Regularización L1",
            definition: "Técnica que añade penalización basada en la suma de valores absolutos de parámetros",
            category: "regularizacion"
        },
        {
            term: "Regularización L2",
            definition: "Técnica que añade penalización basada en la suma de cuadrados de parámetros",
            category: "regularizacion"
        },
        {
            term: "Bias-Variance Tradeoff",
            definition: "Balance entre la capacidad del modelo de ajustarse a datos específicos vs generalizar",
            category: "conceptos"
        },
        {
            term: "Cross-Validation",
            definition: "Método para evaluar el rendimiento dividiendo datos en entrenamiento y validación",
            category: "evaluacion"
        },
        {
            term: "Hyperparameter Tuning",
            definition: "Proceso de optimizar los parámetros de configuración del modelo",
            category: "optimizacion"
        },
        {
            term: "Grid Search",
            definition: "Método exhaustivo para encontrar los mejores hiperparámetros",
            category: "optimizacion"
        },
        {
            term: "Random Search",
            definition: "Método que prueba combinaciones aleatorias de hiperparámetros",
            category: "optimizacion"
        },
        {
            term: "Ensemble Methods",
            definition: "Técnicas que combinan múltiples modelos para mejorar el rendimiento",
            category: "tecnicas"
        },
        {
            term: "Bagging",
            definition: "Técnica de ensemble que entrena múltiples modelos con diferentes subconjuntos de datos",
            category: "ensemble"
        },
        {
            term: "Boosting",
            definition: "Técnica que entrena modelos secuencialmente, cada uno corrigiendo errores del anterior",
            category: "ensemble"
        },
        {
            term: "Feature Selection",
            definition: "Proceso de seleccionar las características más relevantes para el modelo",
            category: "preprocessing"
        },
        {
            term: "Dimensionality Reduction",
            definition: "Técnicas para reducir el número de características manteniendo información importante",
            category: "preprocessing"
        },
        {
            term: "PCA",
            definition: "Principal Component Analysis, técnica para reducir dimensionalidad",
            category: "algoritmos"
        },
        {
            term: "t-SNE",
            definition: "Técnica de reducción de dimensionalidad para visualización de datos",
            category: "visualizacion"
        },
        {
            term: "ROC Curve",
            definition: "Curva que muestra el rendimiento de un clasificador en todos los umbrales",
            category: "evaluacion"
        },
        {
            term: "AUC",
            definition: "Area Under Curve, métrica que resume la curva ROC en un solo número",
            category: "metricas"
        },
        {
            term: "Confusion Matrix",
            definition: "Tabla que describe el rendimiento de un modelo de clasificación",
            category: "evaluacion"
        },
        {
            term: "True Positive",
            definition: "Casos positivos correctamente identificados por el modelo",
            category: "metricas"
        },
        {
            term: "False Positive",
            definition: "Casos negativos incorrectamente clasificados como positivos",
            category: "metricas"
        },
        {
            term: "True Negative",
            definition: "Casos negativos correctamente identificados por el modelo",
            category: "metricas"
        },
        {
            term: "False Negative",
            definition: "Casos positivos incorrectamente clasificados como negativos",
            category: "metricas"
        }
    ],

    practicalExercises: [
        {
            id: 1,
            title: "Clasificador de Sentimientos con Naive Bayes",
            difficulty: "Principiante",
            estimatedTime: "2-3 horas",
            description: "Implementar un clasificador de sentimientos para reseñas de productos usando el algoritmo Naive Bayes",
            steps: [
                "Cargar y explorar dataset de reseñas",
                "Preprocesar texto (limpieza, tokenización)",
                "Crear características usando Bag of Words",
                "Entrenar modelo Naive Bayes",
                "Evaluar rendimiento con métricas apropiadas",
                "Probar con nuevas reseñas"
            ],
            technologies: ["Python", "scikit-learn", "pandas", "nltk"],
            learningObjectives: [
                "Comprender preprocesamiento de texto",
                "Implementar algoritmo Naive Bayes",
                "Evaluar modelos de clasificación",
                "Interpretar métricas de rendimiento"
            ]
        },
        {
            id: 2,
            title: "Red Neuronal para Reconocimiento de Dígitos",
            difficulty: "Intermedio",
            estimatedTime: "4-5 horas",
            description: "Crear una red neuronal convolucional para clasificar dígitos manuscritos del dataset MNIST",
            steps: [
                "Cargar y visualizar dataset MNIST",
                "Normalizar y preparar datos",
                "Diseñar arquitectura CNN",
                "Entrenar modelo con validación",
                "Evaluar y visualizar resultados",
                "Analizar casos de error"
            ],
            technologies: ["Python", "TensorFlow/Keras", "numpy", "matplotlib"],
            learningObjectives: [
                "Entender arquitecturas CNN",
                "Implementar redes neuronales profundas",
                "Aplicar técnicas de regularización",
                "Visualizar proceso de aprendizaje"
            ]
        },
        {
            id: 3,
            title: "Sistema de Recomendación Colaborativo",
            difficulty: "Intermedio",
            estimatedTime: "3-4 horas",
            description: "Desarrollar un sistema de recomendación de películas usando filtrado colaborativo",
            steps: [
                "Analizar dataset de calificaciones de películas",
                "Implementar similitud coseno entre usuarios",
                "Crear matriz de usuario-item",
                "Generar recomendaciones",
                "Evaluar calidad de recomendaciones",
                "Optimizar rendimiento del sistema"
            ],
            technologies: ["Python", "pandas", "numpy", "scikit-learn"],
            learningObjectives: [
                "Comprender sistemas de recomendación",
                "Implementar filtrado colaborativo",
                "Trabajar con matrices dispersas",
                "Evaluar sistemas de recomendación"
            ]
        },
        {
            id: 4,
            title: "Chatbot con Procesamiento de Lenguaje Natural",
            difficulty: "Avanzado",
            estimatedTime: "6-8 horas",
            description: "Construir un chatbot inteligente usando técnicas modernas de NLP y modelos de lenguaje",
            steps: [
                "Diseñar arquitectura del chatbot",
                "Implementar pipeline de NLP",
                "Integrar modelo de lenguaje",
                "Crear sistema de intenciones",
                "Implementar manejo de contexto",
                "Desarrollar interfaz de usuario",
                "Evaluar y mejorar respuestas"
            ],
            technologies: ["Python", "transformers", "flask", "spacy"],
            learningObjectives: [
                "Integrar modelos de lenguaje",
                "Manejar contexto conversacional",
                "Implementar pipelines de NLP",
                "Crear interfaces conversacionales"
            ]
        },
        {
            id: 5,
            title: "Detector de Objetos en Tiempo Real",
            difficulty: "Avanzado",
            estimatedTime: "5-7 horas",
            description: "Implementar un sistema de detección de objetos en video usando YOLO",
            steps: [
                "Configurar entorno y dependencias",
                "Cargar modelo YOLO pre-entrenado",
                "Implementar procesamiento de video",
                "Detectar y clasificar objetos",
                "Optimizar para tiempo real",
                "Añadir tracking de objetos",
                "Crear interfaz visual"
            ],
            technologies: ["Python", "OpenCV", "YOLOv5", "PyTorch"],
            learningObjectives: [
                "Aplicar computer vision en tiempo real",
                "Usar modelos pre-entrenados",
                "Optimizar rendimiento",
                "Implementar tracking de objetos"
            ]
        }
    ],

    resources: {
        books: [
            "Pattern Recognition and Machine Learning - Christopher Bishop",
            "The Elements of Statistical Learning - Hastie, Tibshirani, Friedman",
            "Deep Learning - Ian Goodfellow, Yoshua Bengio, Aaron Courville",
            "Hands-On Machine Learning - Aurélien Géron",
            "Artificial Intelligence: A Modern Approach - Russell & Norvig"
        ],
        onlineCourses: [
            "Machine Learning Course - Andrew Ng (Coursera)",
            "Deep Learning Specialization - Andrew Ng (Coursera)",
            "CS229 Machine Learning - Stanford",
            "Fast.ai Practical Deep Learning",
            "MIT 6.034 Introduction to Artificial Intelligence"
        ],
        tools: [
            "Python con librerías: scikit-learn, pandas, numpy",
            "Deep Learning: TensorFlow, PyTorch, Keras",
            "Visualización: matplotlib, seaborn, plotly",
            "Datos: Jupyter Notebooks, Google Colab",
            "Producción: Docker, MLflow, Kubeflow"
        ],
        datasets: [
            "MNIST - Dígitos manuscritos",
            "CIFAR-10 - Clasificación de imágenes",
            "IMDB Reviews - Análisis de sentimientos",
            "Titanic - Predicción de supervivencia",
            "Boston Housing - Regresión de precios"
        ]
    }
};

module.exports = COURSE_DATA;
