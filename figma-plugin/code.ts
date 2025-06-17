
// Figma Plugin Main Code
figma.showUI(__html__, { 
  width: 400, 
  height: 300,
  themeColors: true 
});

// Message handler for communication with the web app
figma.ui.onmessage = async (msg) => {
  console.log('Received message:', msg);

  if (msg.type === 'CREATE_NODES') {
    try {
      const nodes = await createFigmaNodes(msg.nodes);
      
      // Select the created nodes
      if (nodes.length > 0) {
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
      }

      // Send success response
      figma.ui.postMessage({
        type: 'NODES_CREATED',
        success: true,
        count: nodes.length
      });

    } catch (error) {
      console.error('Error creating nodes:', error);
      figma.ui.postMessage({
        type: 'NODES_CREATED',
        success: false,
        error: error.message
      });
    }
  }

  if (msg.type === 'GET_SELECTION') {
    const selection = figma.currentPage.selection;
    figma.ui.postMessage({
      type: 'SELECTION_DATA',
      selection: selection.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }))
    });
  }
};

// Function to create Figma nodes from the converted data
async function createFigmaNodes(nodeData: any[]): Promise<SceneNode[]> {
  const createdNodes: SceneNode[] = [];

  for (const data of nodeData) {
    const node = await createSingleNode(data);
    if (node) {
      figma.currentPage.appendChild(node);
      createdNodes.push(node);
    }
  }

  return createdNodes;
}

// Create individual Figma node based on type
async function createSingleNode(data: any): Promise<SceneNode | null> {
  switch (data.type) {
    case 'FRAME':
      return createFrameNode(data);
    case 'TEXT':
      return await createTextNode(data);
    case 'RECTANGLE':
      return createRectangleNode(data);
    default:
      console.warn(`Unsupported node type: ${data.type}`);
      return null;
  }
}

// Create Frame node with children
function createFrameNode(data: any): FrameNode {
  const frame = figma.createFrame();
  
  frame.name = data.name || 'Frame';
  frame.resize(data.width || 100, data.height || 100);
  
  // Set position if provided
  if (data.x !== undefined && data.y !== undefined) {
    frame.x = data.x;
    frame.y = data.y;
  }

  // Apply fills (background)
  if (data.fills && data.fills.length > 0) {
    frame.fills = data.fills.map(convertFill);
  }

  // Apply corner radius
  if (data.cornerRadius !== undefined) {
    if (typeof data.cornerRadius === 'number') {
      frame.cornerRadius = data.cornerRadius;
    } else if (Array.isArray(data.cornerRadius)) {
      frame.topLeftRadius = data.cornerRadius[0] || 0;
      frame.topRightRadius = data.cornerRadius[1] || 0;
      frame.bottomRightRadius = data.cornerRadius[2] || 0;
      frame.bottomLeftRadius = data.cornerRadius[3] || 0;
    }
  }

  // Apply opacity
  if (data.opacity !== undefined) {
    frame.opacity = data.opacity;
  }

  // Set Auto Layout if specified
  if (data.layoutMode && data.layoutMode !== 'NONE') {
    frame.layoutMode = data.layoutMode;
    
    if (data.itemSpacing) {
      frame.itemSpacing = data.itemSpacing;
    }
    
    if (data.paddingLeft || data.paddingRight || data.paddingTop || data.paddingBottom) {
      frame.paddingLeft = data.paddingLeft || 0;
      frame.paddingRight = data.paddingRight || 0;
      frame.paddingTop = data.paddingTop || 0;
      frame.paddingBottom = data.paddingBottom || 0;
    }

    if (data.primaryAxisAlignItems) {
      frame.primaryAxisAlignItems = data.primaryAxisAlignItems;
    }

    if (data.counterAxisAlignItems) {
      frame.counterAxisAlignItems = data.counterAxisAlignItems;
    }
  }

  // Apply effects (shadows, etc.)
  if (data.effects && data.effects.length > 0) {
    frame.effects = data.effects.map(convertEffect);
  }

  // Create children recursively
  if (data.children && data.children.length > 0) {
    for (const childData of data.children) {
      const childNode = createSingleNode(childData);
      if (childNode) {
        frame.appendChild(childNode);
      }
    }
  }

  return frame;
}

// Create Text node
async function createTextNode(data: any): Promise<TextNode> {
  const textNode = figma.createText();
  
  textNode.name = data.name || 'Text';
  
  // Load font before setting text properties
  const fontName = data.fontName || { family: 'Inter', style: 'Regular' };
  
  try {
    await figma.loadFontAsync(fontName);
    textNode.fontName = fontName;
  } catch (error) {
    console.warn('Failed to load font, using default:', error);
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    textNode.fontName = { family: 'Inter', style: 'Regular' };
  }

  // Set text content
  textNode.characters = data.characters || 'Text';

  // Set font size
  if (data.fontSize) {
    textNode.fontSize = data.fontSize;
  }

  // Set text alignment
  if (data.textAlignHorizontal) {
    textNode.textAlignHorizontal = data.textAlignHorizontal;
  }

  if (data.textAlignVertical) {
    textNode.textAlignVertical = data.textAlignVertical;
  }

  // Set letter spacing
  if (data.letterSpacing) {
    textNode.letterSpacing = data.letterSpacing;
  }

  // Set line height
  if (data.lineHeight) {
    if (typeof data.lineHeight === 'object') {
      textNode.lineHeight = data.lineHeight;
    } else {
      textNode.lineHeight = { value: data.lineHeight, unit: 'PIXELS' };
    }
  }

  // Set text case
  if (data.textCase) {
    textNode.textCase = data.textCase;
  }

  // Set text decoration
  if (data.textDecoration) {
    textNode.textDecoration = data.textDecoration;
  }

  // Apply fills (text color)
  if (data.fills && data.fills.length > 0) {
    textNode.fills = data.fills.map(convertFill);
  }

  // Set size
  if (data.width && data.height) {
    textNode.resize(data.width, data.height);
  }

  // Set position
  if (data.x !== undefined && data.y !== undefined) {
    textNode.x = data.x;
    textNode.y = data.y;
  }

  return textNode;
}

// Create Rectangle node
function createRectangleNode(data: any): RectangleNode {
  const rectangle = figma.createRectangle();
  
  rectangle.name = data.name || 'Rectangle';
  rectangle.resize(data.width || 100, data.height || 100);

  // Set position
  if (data.x !== undefined && data.y !== undefined) {
    rectangle.x = data.x;
    rectangle.y = data.y;
  }

  // Apply fills
  if (data.fills && data.fills.length > 0) {
    rectangle.fills = data.fills.map(convertFill);
  }

  // Apply corner radius
  if (data.cornerRadius !== undefined) {
    if (typeof data.cornerRadius === 'number') {
      rectangle.cornerRadius = data.cornerRadius;
    }
  }

  // Apply opacity
  if (data.opacity !== undefined) {
    rectangle.opacity = data.opacity;
  }

  return rectangle;
}

// Convert fill data to Figma fill format
function convertFill(fillData: any): Paint {
  if (fillData.type === 'SOLID') {
    return {
      type: 'SOLID',
      color: {
        r: fillData.color.r,
        g: fillData.color.g,
        b: fillData.color.b
      },
      opacity: fillData.color.a !== undefined ? fillData.color.a : 1
    };
  }
  
  // Default solid fill
  return {
    type: 'SOLID',
    color: { r: 0, g: 0, b: 0 },
    opacity: 1
  };
}

// Convert effect data to Figma effect format
function convertEffect(effectData: any): Effect {
  if (effectData.type === 'DROP_SHADOW') {
    return {
      type: 'DROP_SHADOW',
      color: {
        r: effectData.color.r,
        g: effectData.color.g,
        b: effectData.color.b,
        a: effectData.color.a || 1
      },
      offset: effectData.offset || { x: 0, y: 4 },
      radius: effectData.radius || 4,
      spread: effectData.spread || 0,
      visible: true,
      blendMode: 'NORMAL'
    };
  }

  // Default drop shadow
  return {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 4 },
    radius: 4,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  };
}

// Clean up function
figma.on('close', () => {
  console.log('Plugin closed');
});
