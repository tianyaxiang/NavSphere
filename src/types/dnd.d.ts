declare module '@hello-pangea/dnd' {
  import type { ReactNode } from 'react'

  export interface DraggableProvided {
    draggableProps: {
      style?: React.CSSProperties
      [key: string]: unknown
    }
    dragHandleProps: {
      [key: string]: unknown
    } | null
    innerRef: (element?: HTMLElement | null) => void
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => void
    placeholder?: ReactNode
    droppableProps: {
      [key: string]: unknown
    }
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean
    isDropAnimating: boolean
    draggingOver: string | null
    dropAnimation: {
      duration: number
      curve: string
      moveTo: {
        x: number
        y: number
      }
    } | null
  }

  export interface DraggableRubric {
    draggableId: string
    type: string
    source: {
      droppableId: string
      index: number
    }
  }

  export interface DropResult {
    draggableId: string
    type: string
    source: {
      droppableId: string
      index: number
    }
    destination: {
      droppableId: string
      index: number
    } | null
    reason: 'DROP' | 'CANCEL'
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean
    draggingOverWith: string | null
    draggingFromThisWith: string | null
    isUsingPlaceholder: boolean
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void
    onDragStart?: (initial: DraggableRubric) => void
    onDragUpdate?: (initial: DraggableRubric) => void
    children: ReactNode
  }

  export interface DroppableProps {
    droppableId: string
    type?: string
    mode?: 'standard' | 'virtual'
    isDropDisabled?: boolean
    isCombineEnabled?: boolean
    direction?: 'vertical' | 'horizontal'
    ignoreContainerClipping?: boolean
    renderClone?: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => ReactNode
    getContainerForClone?: () => HTMLElement
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => ReactNode
  }

  export interface DraggableProps {
    draggableId: string
    index: number
    isDragDisabled?: boolean
    disableInteractiveElementBlocking?: boolean
    shouldRespectForcePress?: boolean
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ReactNode
  }

  export const DragDropContext: React.FC<DragDropContextProps>
  export const Droppable: React.FC<DroppableProps>
  export const Draggable: React.FC<DraggableProps>
} 