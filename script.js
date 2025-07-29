const config = {
  slots: 14,
  centerX: 400,
  centerY: 400,
  outerRadius: 500,
  innerRadius: 300,
  gapWidth: 10, // Ширина щели в пикселях
  cornerRadius: 15, // Радиус закругления углов
  prizes: [
    { emoji: '💎', value: '500' },
    { emoji: '🎁', value: '100' },
    { emoji: '⭐', value: '200' },
    { emoji: '🎯', value: '50' },
    { emoji: '🏆', value: '1000' },
    { emoji: '💰', value: '300' },
    { emoji: '🎪', value: '150' },
    { emoji: '🎨', value: '750' },
    { emoji: '🎭', value: '250' },
    { emoji: '🎪', value: '400' },
    { emoji: '🎭', value: '15' },
    { emoji: '🎪', value: '15' },
    { emoji: '🎭', value: '75' },
    { emoji: '🎪', value: '800' }
  ]
};

function createSectorWithStraightGaps(
  cx, cy, innerR, outerR,
  slotIndex, totalSlots, gapWidth,
  cornerRadius, adjustFactor = 0.1
) {
  const angleStep = (2 * Math.PI) / totalSlots;
  const centerAngle = slotIndex * angleStep - Math.PI / 2;

  const dirX = Math.cos(centerAngle);
  const dirY = Math.sin(centerAngle);
  const perpX = -dirY;
  const perpY = dirX;

  const outerCircumference = 2 * Math.PI * outerR;
  const sectorWidthOuter = (outerCircumference / totalSlots) - gapWidth;
  const halfWidthOuter = sectorWidthOuter / 2;

  const innerCircumference = 2 * Math.PI * innerR;
  const sectorWidthInner = (innerCircumference / totalSlots) - gapWidth;
  const halfWidthInner = sectorWidthInner / 2;

  const outerLeft = {
    x: cx + outerR * dirX - halfWidthOuter * perpX,
    y: cy + outerR * dirY - halfWidthOuter * perpY
  };
  const outerRight = {
    x: cx + outerR * dirX + halfWidthOuter * perpX,
    y: cy + outerR * dirY + halfWidthOuter * perpY
  };
  const innerLeft = {
    x: cx + innerR * dirX - halfWidthInner * perpX,
    y: cy + innerR * dirY - halfWidthInner * perpY
  };
  const innerRight = {
    x: cx + innerR * dirX + halfWidthInner * perpX,
    y: cy + innerR * dirY + halfWidthInner * perpY
  };

  const maxRadius = Math.min(
    cornerRadius,
    (outerR - innerR) * 0.9,
    halfWidthInner * 0.5
  );


  const outerLeftAngle = Math.atan2(outerLeft.y - cy, outerLeft.x - cx);
  const outerRightAngle = Math.atan2(outerRight.y - cy, outerRight.x - cx);
  const outerAngleAdjust = maxRadius / outerR;

  const outerLeftStart = {
    x: cx + outerR * Math.cos(outerLeftAngle + outerAngleAdjust),
    y: cy + outerR * Math.sin(outerLeftAngle + outerAngleAdjust)
  };
  const outerRightEnd = {
    x: cx + outerR * Math.cos(outerRightAngle - outerAngleAdjust),
    y: cy + outerR * Math.sin(outerRightAngle - outerAngleAdjust)
  };

  const innerLeftAngle = Math.atan2(innerLeft.y - cy, innerLeft.x - cx);
  const innerRightAngle = Math.atan2(innerRight.y - cy, innerRight.x - cx);
  const innerAngleAdjust = maxRadius / innerR;

  const innerLeftEnd = {
    x: cx + innerR * Math.cos(innerLeftAngle + innerAngleAdjust),
    y: cy + innerR * Math.sin(innerLeftAngle + innerAngleAdjust)
  };
  const innerRightStart = {
    x: cx + innerR * Math.cos(innerRightAngle - innerAngleAdjust),
    y: cy + innerR * Math.sin(innerRightAngle - innerAngleAdjust)
  };

  // 🔧 Небольшая корректировка (ближе к оригиналу)
  const rightOuterCorner = {
    x: outerRight.x + adjustFactor * (innerRight.x - outerRight.x),
    y: outerRight.y + adjustFactor * (innerRight.y - outerRight.y)
  };
  const rightInnerCorner = {
    x: innerRight.x - adjustFactor * (innerRight.x - outerRight.x),
    y: innerRight.y - adjustFactor * (innerRight.y - outerRight.y)
  };
  const leftOuterCorner = {
    x: outerLeft.x + adjustFactor * (innerLeft.x - outerLeft.x),
    y: outerLeft.y + adjustFactor * (innerLeft.y - outerLeft.y)
  };
  const leftInnerCorner = {
    x: innerLeft.x - adjustFactor * (innerLeft.x - outerLeft.x),
    y: innerLeft.y - adjustFactor * (innerLeft.y - outerLeft.y)
  };

  let outerSweep = outerRightAngle - outerLeftAngle;
  if (outerSweep < 0) outerSweep += 2 * Math.PI;
  if (outerSweep > Math.PI) outerSweep -= 2 * Math.PI;

  const largeArcOuter = Math.abs(outerSweep) > Math.PI ? 1 : 0;
  const smoothFactor = 0.2; // 0.1–0.3 для мягкости
  return `
    M ${outerLeftStart.x} ${outerLeftStart.y}
    A ${outerR} ${outerR} 0 ${largeArcOuter} 1 ${outerRightEnd.x} ${outerRightEnd.y}

    A ${maxRadius} ${maxRadius} 0 0 1 ${rightOuterCorner.x} ${rightOuterCorner.y}
    L ${rightInnerCorner.x} ${rightInnerCorner.y}
    Q ${innerRight.x} ${innerRight.y} ${innerRightStart.x} ${innerRightStart.y}

    A ${innerR} ${innerR} 0 ${largeArcOuter} 0 ${innerLeftEnd.x} ${innerLeftEnd.y}

    Q ${innerLeft.x} ${innerLeft.y} ${leftInnerCorner.x} ${leftInnerCorner.y}
    L ${leftOuterCorner.x} ${leftOuterCorner.y}
    A ${maxRadius} ${maxRadius} 0 0 1 ${outerLeftStart.x} ${outerLeftStart.y}
    Z
  `;
}


function createSlots() {
  const svg = document.querySelector('.roulette');

  // Создаем рамку-пончик
  const donutFrame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const outerRadius = config.outerRadius + 10; // Немного больше основного колеса
  const innerRadius = config.innerRadius - 10; // Немного меньше внутреннего радиуса
  
  // Создаем путь для рамки
  const donutPath = `
    M ${config.centerX - outerRadius}, ${config.centerY}
    a ${outerRadius},${outerRadius} 0 1,0 ${outerRadius * 2},0
    a ${outerRadius},${outerRadius} 0 1,0 -${outerRadius * 2},0
    M ${config.centerX - innerRadius}, ${config.centerY}
    a ${innerRadius},${innerRadius} 0 1,0 ${innerRadius * 2},0
    a ${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0
    Z
  `;
  
  donutFrame.setAttribute('d', donutPath);
  donutFrame.setAttribute('fill', '#222222');
  donutFrame.setAttribute('fill-rule', 'evenodd');
  donutFrame.setAttribute('stroke', '#444');
  donutFrame.setAttribute('stroke-width', '2');
  svg.appendChild(donutFrame);


  // Создаем defs и фильтр ОДИН РАЗ перед циклом
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  // Создаем фильтр для размытия если его еще нет
  if (!document.getElementById('slot-glow')) {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'slot-glow');
    filter.setAttribute('x', '-200%');
    filter.setAttribute('y', '-200%');
    filter.setAttribute('width', '400%');
    filter.setAttribute('height', '400%');

    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '25'); // Сила размытия

    filter.appendChild(blur);
    defs.appendChild(filter);
  }

  for (let i = 0; i < config.slots; i++) {
    const slotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    slotGroup.classList.add('slot');
    slotGroup.setAttribute('data-slot', i);

    const prize = config.prizes[i % config.prizes.length];
    let strokeColor = '#aaa';
    if (prize.value >= 500) strokeColor = '#cc3000ff';
    else if (prize.value >= 300) strokeColor = '#ff00ff';
    else if (prize.value >= 200) strokeColor = '#3cff00';
    else if (prize.value >= 100) strokeColor = '#00bfff';

    const angleStep = (2 * Math.PI) / config.slots;
    const centerAngle = i * angleStep - Math.PI / 2;
    const slotHeight = config.outerRadius - config.innerRadius;
    const slotWidth = (2 * Math.PI * config.outerRadius / config.slots) - config.gapWidth;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', createSectorWithStraightGaps(
      config.centerX,
      config.centerY,
      config.innerRadius + 1.5,
      config.outerRadius - 1.5,
      i,
      config.slots,
      config.gapWidth,
      config.cornerRadius
    ));
    path.setAttribute('fill', '#222222');
    path.setAttribute('stroke', 'none');
    slotGroup.appendChild(path);

    // --- Создание маски и градиента для свечения ---
    const maskId = `slot-mask-${i}`;
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);

    const maskShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    maskShape.setAttribute('d', path.getAttribute('d'));
    maskShape.setAttribute('fill', 'white');
    mask.appendChild(maskShape);
    defs.appendChild(mask);

    const gradientId = `glow-gradient-${i}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '50%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', strokeColor);
    stop1.setAttribute('stop-opacity', '1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '70%');
    stop2.setAttribute('stop-color', strokeColor);
    stop2.setAttribute('stop-opacity', '0.3');

    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', strokeColor);
    stop3.setAttribute('stop-opacity', '0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    // --- Свечение с правильной позицией ---
    const maskedGlow = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    maskedGlow.setAttribute('mask', `url(#${maskId})`);
    
    // 🎯 Вот исправленная часть: сдвигаем свечение ближе к прямоугольнику редкости
    // Вместо середины (slotHeight / 2), используем 75% высоты слота
    const glowDistance = config.innerRadius + slotHeight * 0.8; 
    const glowCenterX = config.centerX + (glowDistance * Math.cos(centerAngle));
    const glowCenterY = config.centerY + (glowDistance * Math.sin(centerAngle));

    const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowCircle.setAttribute('cx', glowCenterX);
    glowCircle.setAttribute('cy', glowCenterY);
    glowCircle.setAttribute('r', slotHeight * 0.6); // Можно уменьшить радиус для более локального свечения
    glowCircle.setAttribute('fill', `url(#${gradientId})`);
    glowCircle.setAttribute('filter', 'url(#slot-glow)');
    glowCircle.setAttribute('opacity', '0.3');

    maskedGlow.appendChild(glowCircle);
    slotGroup.appendChild(maskedGlow);

    // --- Обводка и другие элементы ---
    const strokeOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    strokeOverlay.setAttribute('d', path.getAttribute('d'));
    strokeOverlay.setAttribute('fill', 'none');
    strokeOverlay.setAttribute('stroke', strokeColor);
    strokeOverlay.setAttribute('stroke-width', 3);
    strokeOverlay.setAttribute('pointer-events', 'none');
    slotGroup.appendChild(strokeOverlay);

    const rectWidth = slotWidth / 2;
    const rectHeight = slotHeight / 24;
    const centerDistance = config.innerRadius + slotHeight - rectHeight * 1.5;
    const offset = 5;
    const rectCenterX = config.centerX + (centerDistance * Math.cos(centerAngle)) + offset * Math.cos(centerAngle);
    const rectCenterY = config.centerY + (centerDistance * Math.sin(centerAngle)) + offset * Math.sin(centerAngle);

    const bottomRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bottomRect.setAttribute('x', rectCenterX - rectWidth / 2);
    bottomRect.setAttribute('y', rectCenterY - rectHeight / 2);
    bottomRect.setAttribute('width', rectWidth);
    bottomRect.setAttribute('height', rectHeight);
    bottomRect.setAttribute('rx', 10);
    bottomRect.setAttribute('ry', 10);
    bottomRect.setAttribute('fill', strokeColor);

    const angleDeg = (centerAngle * 180) / Math.PI + 90;
    bottomRect.setAttribute('transform', `rotate(${angleDeg} ${rectCenterX} ${rectCenterY})`);
    slotGroup.appendChild(bottomRect);

    const textRadius = (config.outerRadius + config.innerRadius) / 2;
    const emojiX = config.centerX + (textRadius - 30) * Math.cos(centerAngle);
    const emojiY = config.centerY + (textRadius - 30) * Math.sin(centerAngle);
    const textX = config.centerX + (textRadius + 15) * Math.cos(centerAngle);
    const textY = config.centerY + (textRadius + 15) * Math.sin(centerAngle);

    const emoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    emoji.classList.add('slot-emoji');
    emoji.setAttribute('x', emojiX);
    emoji.setAttribute('y', emojiY);
    emoji.textContent = prize.emoji;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.classList.add('slot-text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.textContent = prize.value;

    slotGroup.appendChild(emoji);
    slotGroup.appendChild(text);

    slotGroup.addEventListener('click', () => {
      console.log(`Выбран слот ${i}: ${prize.emoji} ${prize.value}`);
    });

    svg.appendChild(slotGroup);
  }
}

let isSpinning = false;
function toggleSpin() {
  const roulette = document.querySelector('.roulette');
  const button = document.querySelector('.spin-button');
  if (!isSpinning) {
    roulette.classList.add('spinning');
    button.textContent = 'ОСТАНОВИТЬ';
    isSpinning = true;
  } else {
    roulette.classList.remove('spinning');
    button.textContent = 'ВРАЩАТЬ';
    isSpinning = false;
  }
}

document.addEventListener('DOMContentLoaded', createSlots);
