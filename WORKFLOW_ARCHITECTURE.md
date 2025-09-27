# Workflow Automation Architecture Pattern

## Core Components

### 1. Agent System
- **Definition Format**: Markdown files with embedded YAML configuration
- **Structure**:
  - Agent metadata (name, id, role, persona)
  - Activation instructions
  - Core principles
  - Commands and dependencies
  - Customization overrides

### 2. Workflow Engine
- **Definition Format**: YAML files
- **Key Elements**:
  - Triggers (commands, intents)
  - Input parameters
  - Agent assignments per step
  - Step sequencing with dependencies
  - Output definitions
  - Template references

### 3. Template System
- **Purpose**: Structured data collection and output formatting
- **Features**:
  - Elicitation support (interactive prompts)
  - Repeatable sections
  - Conditional subsections
  - Output format specification
  - Variable interpolation

## Architecture Pattern

```yaml
workflow:
  name: workflow-name
  triggers:
    - command: /command
    - intent: "natural language trigger"

  inputs:
    - parameter1
    - parameter2

  agents:
    - agent1
    - agent2

  steps:
    - id: step1
      agent: agent1
      inputs: [previous_outputs]
      uses: template_reference
      outputs: output_name

    - id: step2
      agent: agent2
      inputs: step1.output_name
      repeat_for: collection
      outputs: final_output
```

## Key Design Principles

1. **Declarative Configuration**: Workflows defined in YAML, not code
2. **Agent Specialization**: Each agent has specific expertise and persona
3. **Template-Driven**: Structured templates ensure consistent outputs
4. **Pipeline Architecture**: Steps execute sequentially with data flow
5. **Elicitation Support**: Interactive prompts for user input when needed

## Implementation Strategy for Your App

### Phase 1: Core Engine
- YAML parser for workflow definitions
- Agent loader and persona manager
- Step executor with dependency resolution
- Template processor with variable substitution

### Phase 2: Agent Framework
- Agent base class with persona injection
- Command router
- Context management (inputs/outputs)
- State persistence between steps

### Phase 3: Template System
- Template parser
- Elicitation handler (UI prompts)
- Output formatter
- Variable interpolation engine

### Phase 4: Orchestration
- Workflow scheduler
- Step dependency resolver
- Error handling and retry logic
- Progress tracking and reporting

## Example Implementation (Python)

```python
class WorkflowEngine:
    def __init__(self, workflow_path):
        self.workflow = self.load_yaml(workflow_path)
        self.agents = self.load_agents()
        self.context = {}

    def execute(self, inputs):
        for step in self.workflow['steps']:
            agent = self.agents[step['agent']]
            step_inputs = self.resolve_inputs(step, self.context)

            if step.get('uses'):
                template = self.load_template(step['uses'])
                output = agent.execute_with_template(template, step_inputs)
            else:
                output = agent.execute(step_inputs)

            self.context[step['outputs']] = output

        return self.context

class Agent:
    def __init__(self, config):
        self.name = config['name']
        self.persona = config['persona']
        self.principles = config['core_principles']

    def execute_with_template(self, template, inputs):
        # Process template with agent persona
        for section in template['sections']:
            if section.get('elicit'):
                response = self.prompt_user(section)
            else:
                response = self.generate(section, inputs)
        return response
```

## Workflow Execution Flow

1. **Trigger Detection**: Command or intent matches workflow
2. **Input Collection**: Gather required parameters
3. **Agent Loading**: Load specialized agents for workflow
4. **Step Execution**:
   - Resolve input dependencies
   - Apply templates if specified
   - Execute agent with persona
   - Store outputs in context
5. **Output Generation**: Format final results

## Benefits of This Pattern

- **Modularity**: Agents and workflows are independent
- **Reusability**: Templates and agents used across workflows
- **Maintainability**: Declarative YAML easier to modify
- **Scalability**: Add new workflows without code changes
- **Testability**: Each component testable in isolation