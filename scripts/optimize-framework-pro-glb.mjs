import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2] ?? path.join(projectRoot, 'models-source/framework-laptop-13-pro-full.glb');
const outputPath = process.argv[3] ?? path.join(projectRoot, 'public/models/framework-laptop-13-pro.glb');

const exteriorParts = new Set([
  'POC_13_LCD_COVER_AL_1',
  'GFW30_135_FHD__HADS_A',
  'GFW30_LCD_BEZEL_1',
  'GFW30_LCD_CAMERA_LENS_1',
  'GFW30_LCD_BEZEL_ALS_LENS_1',
  'GFW30_LCD_BEZEL_CAP_1',
  'GFW30_LCD_LED_LENS_1',
  'GFW30_LCD_LED_LENS_MYLAR_1',
  'GFW30_CAMERA_BTN_1',
  'GFW30_MIC_BTN_1',
  'SAKURA_LOG_UP_AL',
  'LFP30_LOGO',
  'LFP30_LOG_D_AL',
  '00_LILAC_HAPTIC_MODULE_ASM_0613',
  'LILAC_FPR_ASSY_20241227A',
  'LFP30_LCD_HINGE_SUP_BRK_L2',
  'LFP30_HINGE_L_LCD_BRK',
  'LFP30_HINGE_L_LCD_BRK001',
  'LFP30_LOW_IO_CARD_BRK_L_1',
  'LFP30_LOW_IO_CARD_BRK_R_1',
  'LFP30_LOG_LOW_CARD_LENS',
  'LFP30_LOG_LOW_CARD_LENS001',
  'LFP30_D_FOOT_RUB_R_P',
  'LFP30_D_FOOT_RUB_R_R',
  'LFP30_D_FOOT_RUB_F_R',
  'LFP30_D_FOOT_RUB_F_P',
  'LFP30_D_FOOT_RUB_F_R001',
  'LFP30_D_FOOT_RUB_F_P001',
  // Hardware that sits in the lid, behind the bezel. Visible through the clear bezels.
  'POC_P_13_LCD_MG_HINGE_1',
  'POC_P_13_LCD_MG_HINGE_001',
  'POC_P_13_LCD_MG_HINGE_002',
  'POC_P_13_LCD_HINGE_PLATE_L_1',
  'POC_P_13_LCD_HINGE_PLATE_R_1',
  'POC_P_13_LCD_MAGNET_1',
  'POC_P_13_LCD_MAGNET_001',
  'POC_P_13_LCD_MAGNET_002',
  'POC_P_13_LCD_MAGNET_003',
  'POC_P_13_LCD_MAGNET_004',
  'POC_P_13_LCD_MAGNET_005',
  'POC_P_13_LCD_MAGNET_006',
  'POC_P_13_LCD_MAGNET_007',
  'POC_P_13_LCD_MAGNET_008',
  'POC_P_13_LCD_MAGNET_009',
  'POC_P_13_LCD_MG_SIDE_1',
  'POC_P_13_LCD_MG_SIDE_001',
  'POC_P_13_LCD_MG_SIDE_002',
  'POC_P_13_LCD_MG_SIDE_003',
  'POC_P_13_LCD_MG_SIDE_004',
  'POC_P_13_LCD_MG_SIDE_005',
  'POC_P_13_LCD_MG_SIDE_006',
  'POC_P_13_LCD_MG_SIDE_007',
  'POC_P_13_LCD_MG_SIDE_008',
  'POC_P_13_LCD_MG_SIDE_009',
  'POC_P_13_LCD_SLEEP_MG_1',
  'POC_P_13_LCD_PANEL_BRK_L_1',
  'POC_13_LCD_PANEL_BRK_R_1',
  'POC_P_13_LOG_LOW_MAGNET_1',
  'POC_P_13_LOG_LOW_MAGNET_001',
  'POC_P_13_LCD_MG_CAM_1',
  'POC_P_13_LCD_MG_CAM_001',
  'GFW30_LCD_MAGNET_BRK_HINGE_1',
  'GFW30_LCD_MAGNET_BRK_HINGE_001',
  'GFW30_LCD_MAGNET_BRK_CAP_1',
  'GFW30_LCD_MAGNET_BRK_1',
  'GFW30_LCD_MAGNET_BRK_001',
  'GFW30_LCD_MAGNET_BRK_002',
  'GFW30_LCD_MAGNET_BRK_003',
  'GFW30_LCD_MAGNET_BRK_004',
  'GFW30_LCD_MAGNET_BRK_005',
  'GFW30_LCD_MAGNET_BRK_006',
  'GFW30_LCD_MAGNET_BRK_007',
  'GFW30_LCD_MAGNET_BRK_008',
  'GFW30_LCD_MAGNET_BRK_009',
  'GFW30_LCD_MAGNET_BRK_SIDE_1',
  'GFW30_CAMERA_BTN_BRK_1',
  'GFW30_CAMERA_BTN_BRK_2_1',
  'GFW30_CAMERA_BTN_SUPPORT_BRK_1',
  'GFW30_MIC_BTN_BRK_1',
  'GFW30_MIC_BTN_BRK_2_1',
  'GFW30_MIC_BTN_SUPPORT_BRK_1',
]);

const sourceBytes = fs.readFileSync(inputPath);
if (sourceBytes.toString('ascii', 0, 4) !== 'glTF') {
  throw new Error(`${inputPath} is not a GLB file`);
}

const jsonLength = sourceBytes.readUInt32LE(12);
const jsonStart = 20;
const gltf = JSON.parse(sourceBytes.toString('utf8', jsonStart, jsonStart + jsonLength));
const binaryHeader = jsonStart + jsonLength;
if (sourceBytes.readUInt32LE(binaryHeader + 4) !== 0x004e4942) {
  throw new Error('GLB is missing its binary chunk');
}
const binaryLength = sourceBytes.readUInt32LE(binaryHeader);
const sourceBinary = sourceBytes.subarray(binaryHeader + 8, binaryHeader + 8 + binaryLength);

const sourceViews = gltf.bufferViews;
const sourceAccessors = gltf.accessors;
const outputViews = [];

function componentsFor(type) {
  return ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 })[type];
}

function readAccessor(accessorIndex) {
  const accessor = sourceAccessors[accessorIndex];
  const view = sourceViews[accessor.bufferView];
  const componentBytes = accessor.componentType === 5126 || accessor.componentType === 5125 ? 4
    : accessor.componentType === 5123 ? 2 : 1;
  const components = componentsFor(accessor.type);
  const stride = view.byteStride ?? componentBytes * components;
  const start = view.byteOffset + (accessor.byteOffset ?? 0);
  const values = new Array(accessor.count * components);

  for (let i = 0; i < accessor.count; i += 1) {
    for (let j = 0; j < components; j += 1) {
      const offset = start + i * stride + j * componentBytes;
      const index = i * components + j;
      if (accessor.componentType === 5126) values[index] = sourceBinary.readFloatLE(offset);
      else if (accessor.componentType === 5125) values[index] = sourceBinary.readUInt32LE(offset);
      else if (accessor.componentType === 5123) values[index] = sourceBinary.readUInt16LE(offset);
      else if (accessor.componentType === 5121) values[index] = sourceBinary.readUInt8(offset);
      else throw new Error(`Unsupported glTF component type ${accessor.componentType}`);
    }
  }

  return { values, accessor, components };
}

const binaryChunks = [];
let binaryOffset = 0;
function appendBinary(buffer, target) {
  const padding = (4 - (binaryOffset % 4)) % 4;
  if (padding) {
    binaryChunks.push(Buffer.alloc(padding));
    binaryOffset += padding;
  }
  const byteOffset = binaryOffset;
  binaryChunks.push(buffer);
  binaryOffset += buffer.byteLength;
  const bufferView = { buffer: 0, byteOffset, byteLength: buffer.byteLength };
  if (target !== undefined) bufferView.target = target;
  outputViews.push(bufferView);
  return outputViews.length - 1;
}

const mergedAccessors = [];
function appendFloatAttribute(values, components, type, withBounds = false) {
  const data = Buffer.alloc(values.length * 4);
  let min;
  let max;
  if (withBounds) {
    min = Array(components).fill(Infinity);
    max = Array(components).fill(-Infinity);
  }
  for (let i = 0; i < values.length; i += 1) {
    data.writeFloatLE(values[i], i * 4);
    if (withBounds) {
      const component = i % components;
      min[component] = Math.min(min[component], values[i]);
      max[component] = Math.max(max[component], values[i]);
    }
  }
  const view = appendBinary(data, 34962);
  const accessor = {
    bufferView: view,
    componentType: 5126,
    count: values.length / components,
    type,
  };
  if (withBounds) {
    accessor.min = min;
    accessor.max = max;
  }
  mergedAccessors.push(accessor);
  return mergedAccessors.length - 1;
}

function mergeMesh(mesh) {
  const groups = new Map();
  for (const primitive of mesh.primitives) {
    const materialKey = primitive.material ?? 'none';
    const key = `${materialKey}:${primitive.mode ?? 4}:${Object.keys(primitive.attributes).sort().join(',')}`;
    if (!groups.has(key)) groups.set(key, { material: primitive.material, mode: primitive.mode, attributes: Object.keys(primitive.attributes), primitives: [] });
    groups.get(key).primitives.push(primitive);
  }

  const primitives = [];
  for (const group of groups.values()) {
    const attributeData = new Map(group.attributes.map((name) => [name, []]));
    const mergedIndices = [];
    let vertexOffset = 0;

    for (const primitive of group.primitives) {
      let vertexCount;
      for (const name of group.attributes) {
        const data = readAccessor(primitive.attributes[name]);
        attributeData.get(name).push(data.values);
        if (name === 'POSITION') vertexCount = data.accessor.count;
      }

      if (primitive.indices !== undefined) {
        const indices = readAccessor(primitive.indices).values;
        for (const index of indices) mergedIndices.push(index + vertexOffset);
      } else if (vertexCount !== undefined) {
        for (let index = 0; index < vertexCount; index += 1) mergedIndices.push(index + vertexOffset);
      }
      vertexOffset += vertexCount ?? 0;
    }

    const attributes = {};
    for (const name of group.attributes) {
      const type = sourceAccessors[group.primitives[0].attributes[name]].type;
      const chunks = attributeData.get(name);
      const valueCount = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const values = new Float32Array(valueCount);
      let valueOffset = 0;
      for (const chunk of chunks) {
        values.set(chunk, valueOffset);
        valueOffset += chunk.length;
      }
      attributes[name] = appendFloatAttribute(values, componentsFor(type), type, name === 'POSITION');
    }

    const indexBytes = Buffer.alloc(mergedIndices.length * 4);
    let maxIndex = 0;
    mergedIndices.forEach((index, offset) => {
      indexBytes.writeUInt32LE(index, offset * 4);
      maxIndex = Math.max(maxIndex, index);
    });
    const indexView = appendBinary(indexBytes, 34963);
    const indexAccessor = mergedAccessors.length;
    mergedAccessors.push({
      bufferView: indexView,
      componentType: 5125,
      count: mergedIndices.length,
      type: 'SCALAR',
      min: [0],
      max: [maxIndex],
    });

    const merged = { attributes, indices: indexAccessor, mode: group.mode ?? 4 };
    if (group.material !== undefined) merged.material = group.material;
    primitives.push(merged);
  }

  return { ...mesh, primitives };
}

const retainedNodes = gltf.nodes
  .map((node, index) => ({ node, index }))
  .filter(({ node, index }) => index === 0 || exteriorParts.has(node.name) || /^GFW30_KB_/.test(node.name ?? ''));
const retainedIndices = new Set(retainedNodes.map(({ index }) => index));
const meshMap = new Map();
const outputMeshes = [];
for (const { node } of retainedNodes) {
  if (node.mesh === undefined) continue;
  if (!meshMap.has(node.mesh)) {
    meshMap.set(node.mesh, outputMeshes.length);
    outputMeshes.push(mergeMesh(gltf.meshes[node.mesh]));
  }
}

const nodeMap = new Map(retainedNodes.map(({ index }, newIndex) => [index, newIndex]));
const outputNodes = retainedNodes.map(({ node }) => ({ ...node }));
for (const node of outputNodes) {
  if (node.mesh !== undefined) node.mesh = meshMap.get(node.mesh);
  if (node.children) node.children = node.children.filter((child) => retainedIndices.has(child)).map((child) => nodeMap.get(child));
}
outputNodes[0].children = retainedNodes
  .filter(({ index }) => index !== 0 && gltf.nodes[0].children?.includes(index))
  .map(({ index }) => nodeMap.get(index));

gltf.nodes = outputNodes;
gltf.meshes = outputMeshes;
gltf.accessors = mergedAccessors;
gltf.bufferViews = outputViews;
gltf.buffers = [{ byteLength: binaryOffset }];
const outputBinary = Buffer.concat(binaryChunks, binaryOffset);

const jsonBytes = Buffer.from(JSON.stringify(gltf), 'utf8');
const paddedJsonLength = Math.ceil(jsonBytes.length / 4) * 4;
const paddedBinaryLength = Math.ceil(outputBinary.length / 4) * 4;
const totalLength = 12 + 8 + paddedJsonLength + 8 + paddedBinaryLength;
const output = Buffer.alloc(totalLength);
output.writeUInt32LE(0x46546c67, 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(totalLength, 8);
output.writeUInt32LE(paddedJsonLength, 12);
output.writeUInt32LE(0x4e4f534a, 16);
jsonBytes.copy(output, 20);
output.fill(0x20, 20 + jsonBytes.length, 20 + paddedJsonLength);
const outputBinaryHeader = 20 + paddedJsonLength;
output.writeUInt32LE(paddedBinaryLength, outputBinaryHeader);
output.writeUInt32LE(0x004e4942, outputBinaryHeader + 4);
outputBinary.copy(output, outputBinaryHeader + 8);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`Kept ${retainedNodes.length - 1} exterior meshes; merged ${mergedAccessors.length} accessors into ${outputMeshes.reduce((sum, mesh) => sum + mesh.primitives.length, 0)} draw batches.`);
console.log(`Wrote ${(output.length / 1024 / 1024).toFixed(2)} MB to ${outputPath}`);
