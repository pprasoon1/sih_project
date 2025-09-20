export const STAGES = {
    INITIALIZING: 'initializing',
    COLLECTING_INPUTS: 'collecting_inputs',
    ANALYZING: 'analyzing',
    ANALYSIS_COMPLETE: 'analysis_complete',
    READY_TO_SUBMIT: 'ready_to_submit',
    SUBMITTED: 'submitted',
    ERROR: 'error'
};

export const CATEGORIES = {
    POTHOLE: 'pothole',
    STREETLIGHT: 'streetlight',
    GARBAGE: 'garbage',
    WATER: 'water',
    TREE: 'tree',
    OTHER: 'other'
};

export const URGENCY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const STAGE_MESSAGES = {
    [STAGES.INITIALIZING]: 'Setting up AI assistant...',
    [STAGES.COLLECTING_INPUTS]: 'Ready to collect your inputs',
    [STAGES.ANALYZING]: 'AI is analyzing your inputs...',
    [STAGES.ANALYSIS_COMPLETE]: 'Analysis complete',
    [STAGES.READY_TO_SUBMIT]: 'Ready to submit report',
    [STAGES.SUBMITTED]: 'Report submitted successfully!',
    [STAGES.ERROR]: 'An error occurred'
};
