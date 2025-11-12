// Bubble layout utility for non-overlapping positioning
export interface BubblePosition {
  x: number;
  y: number;
  size: number;
}

export interface BubbleDimensions {
  width: number;
  height: number;
}

// Get bubble size in pixels based on priority
export function getBubbleSizeInPixels(priority: number): number {
  // Use mobile-first sizes that match TaskBubble component
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  if (isMobile) {
    switch (priority) {
      case 3: return 100; // High priority - matches Tailwind w-[100px]
      case 2: return 85;  // Medium priority - matches w-[85px]
      case 1: return 70;  // Low priority - matches w-[70px]
      default: return 85;
    }
  } else {
    switch (priority) {
      case 3: return 88; // High priority - 88px diameter
      case 2: return 72; // Medium priority - 72px diameter
      case 1: return 60; // Low priority - 60px diameter
      default: return 72;
    }
  }
}

// Calculate grid-based positions for bubbles to prevent overlapping
export function calculateBubblePositions(
  taskCount: number,
  containerWidth: number,
  containerHeight: number,
  bubbleSizes: number[],
  urgencyLevels: number[]
): BubblePosition[] {
  const positions: BubblePosition[] = [];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  // Responsive padding and margins
  const padding = isMobile ? 15 : 20;
  const marginX = isMobile ? 20 : 40;
  const marginY = isMobile ? 60 : 80;
  
  // Available space
  const availableWidth = containerWidth - (marginX * 2);
  const availableHeight = containerHeight - (marginY * 2);
  
  // Determine layout strategy based on number of tasks
  if (taskCount === 0) return positions;
  
  if (taskCount === 1) {
    // Single bubble - center it
    positions.push({
      x: (containerWidth - bubbleSizes[0]) / 2,
      y: (containerHeight - bubbleSizes[0]) / 2,
      size: bubbleSizes[0]
    });
  } else if (taskCount <= 4 && !isMobile) {
    // Few bubbles on desktop - use flexible horizontal layout
    const totalBubbleWidth = bubbleSizes.reduce((sum, size) => sum + size, 0);
    const totalPadding = (taskCount - 1) * padding;
    const startX = marginX + (availableWidth - totalBubbleWidth - totalPadding) / 2;
    
    let currentX = startX;
    bubbleSizes.forEach((size, i) => {
      // Vary Y position based on urgency and index for visual interest
      const baseY = marginY + availableHeight / 3;
      const urgencyOffset = (3 - urgencyLevels[i]) * 40; // More urgent = higher
      const wavyOffset = Math.sin(i * 0.8) * 30;
      
      positions.push({
        x: currentX,
        y: Math.max(marginY, Math.min(containerHeight - marginY - size, baseY + urgencyOffset + wavyOffset)),
        size
      });
      
      currentX += size + padding;
    });
  } else {
    // Many bubbles or mobile - use grid with smart packing
    // On mobile, use fewer columns for better spacing
    const maxCols = isMobile ? 2 : 5;
    const cols = Math.min(Math.ceil(Math.sqrt(taskCount * (isMobile ? 1 : 1.5))), maxCols);
    const rows = Math.ceil(taskCount / cols);
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    
    bubbleSizes.forEach((size, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Center bubble in its cell with some variation
      const cellCenterX = marginX + col * cellWidth + cellWidth / 2;
      const cellCenterY = marginY + row * cellHeight + cellHeight / 2;
      
      // Add urgency offset (more urgent = higher up)
      const urgencyOffset = (3 - urgencyLevels[i]) * (isMobile ? 15 : 20);
      
      // Add subtle random offset for organic feel (but deterministic based on index)
      // Reduce offset on mobile for tighter layout
      const randomOffsetX = Math.sin(i * 1.3) * (cellWidth * (isMobile ? 0.08 : 0.15));
      const randomOffsetY = Math.cos(i * 1.7) * (cellHeight * (isMobile ? 0.08 : 0.15));
      
      const x = cellCenterX - size / 2 + randomOffsetX;
      const y = cellCenterY - size / 2 + randomOffsetY - urgencyOffset;
      
      positions.push({
        x: Math.max(marginX, Math.min(containerWidth - marginX - size, x)),
        y: Math.max(marginY, Math.min(containerHeight - marginY - size, y)),
        size
      });
    });
  }
  
  return positions;
}

// Check if two bubbles overlap
export function checkOverlap(
  pos1: BubblePosition,
  pos2: BubblePosition,
  padding: number = 20
): boolean {
  const centerX1 = pos1.x + pos1.size / 2;
  const centerY1 = pos1.y + pos1.size / 2;
  const centerX2 = pos2.x + pos2.size / 2;
  const centerY2 = pos2.y + pos2.size / 2;
  
  const distance = Math.sqrt(
    Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
  );
  
  const minDistance = (pos1.size + pos2.size) / 2 + padding;
  
  return distance < minDistance;
}

// Adjust positions to remove overlaps using force-directed algorithm
export function resolveOverlaps(
  positions: BubblePosition[],
  iterations: number = 3
): BubblePosition[] {
  const adjustedPositions = positions.map(pos => ({ ...pos }));
  const padding = 25;
  
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < adjustedPositions.length; i++) {
      for (let j = i + 1; j < adjustedPositions.length; j++) {
        if (checkOverlap(adjustedPositions[i], adjustedPositions[j], padding)) {
          // Calculate repulsion force
          const centerX1 = adjustedPositions[i].x + adjustedPositions[i].size / 2;
          const centerY1 = adjustedPositions[i].y + adjustedPositions[i].size / 2;
          const centerX2 = adjustedPositions[j].x + adjustedPositions[j].size / 2;
          const centerY2 = adjustedPositions[j].y + adjustedPositions[j].size / 2;
          
          const dx = centerX2 - centerX1;
          const dy = centerY2 - centerY1;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const minDistance = (adjustedPositions[i].size + adjustedPositions[j].size) / 2 + padding;
            const overlap = minDistance - distance;
            const force = overlap / distance;
            
            // Move bubbles apart
            adjustedPositions[i].x -= (dx * force) / 2;
            adjustedPositions[i].y -= (dy * force) / 2;
            adjustedPositions[j].x += (dx * force) / 2;
            adjustedPositions[j].y += (dy * force) / 2;
          }
        }
      }
    }
  }
  
  return adjustedPositions;
}

// Responsive bubble size adjustment
export function getResponsiveBubbleScale(windowWidth: number): number {
  if (windowWidth < 640) return 0.85; // Mobile - slightly smaller
  if (windowWidth < 768) return 0.9;  // Small tablet
  if (windowWidth < 1024) return 0.95; // Tablet
  return 1; // Desktop - full size
}