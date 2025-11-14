#!/usr/bin/env node
/* Minimal GoodRunss MCP server (Node/JS) */
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const BASE_URL = process.env.GOODRUNSS_BASE_URL || 'http://localhost:3000';

async function callJSON(path, method = 'GET', body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text, status: res.status }; }
}

const server = new Server({ name: 'goodrunss-mcp', version: '0.1.0' }, {
  tool: {
    async list() {
      return {
        tools: [
          { name: 'gia.chat', description: 'Chat with GIA', inputSchema: { type: 'object', properties: { message: { type: 'string' }, userRole: { type: 'string', enum: ['CLIENT','TRAINER'], default: 'CLIENT' } }, required: ['message'] } },
          { name: 'trainers.search', description: 'Search trainers', inputSchema: { type: 'object', properties: { city: { type: 'string' }, specialty: { type: 'string' } } } },
          { name: 'trainers.get', description: 'Get trainer profile', inputSchema: { type: 'object', properties: { trainerId: { type: 'string' } }, required: ['trainerId'] } },
          { name: 'courts.search', description: 'Search courts/facilities', inputSchema: { type: 'object', properties: { city: { type: 'string' }, sport: { type: 'string' } } } },
          { name: 'bookings.create', description: 'Create a booking', inputSchema: { type: 'object', properties: { trainerId: { type: 'string' }, clientEmail: { type: 'string' }, clientName: { type: 'string' }, scheduledAt: { type: 'string', format: 'date-time' }, type: { type: 'string' }, duration: { type: 'number' }, notes: { type: 'string' }, location: { type: 'string' } }, required: ['trainerId','scheduledAt','type','duration'] } },
          { name: 'messages.send', description: 'Send a message', inputSchema: { type: 'object', properties: { senderId: { type: 'string' }, receiverId: { type: 'string' }, content: { type: 'string' }, messageType: { type: 'string', enum: ['TEXT','IMAGE','FILE'], default: 'TEXT' } }, required: ['senderId','receiverId','content'] } },
          { name: 'messages.list', description: 'List messages or conversations', inputSchema: { type: 'object', properties: { userId: { type: 'string' }, otherUserId: { type: 'string' } }, required: ['userId'] } },
          { name: 'calendar.create', description: 'Create Google Calendar event (trainer access token required on backend)', inputSchema: { type: 'object', properties: { trainerId: { type: 'string' }, startTime: { type: 'string', format: 'date-time' }, endTime: { type: 'string', format: 'date-time' }, clientEmail: { type: 'string' }, sessionType: { type: 'string' }, location: { type: 'string' }, notes: { type: 'string' } }, required: ['trainerId','startTime','endTime','sessionType'] } },
          { name: 'email.send', description: 'Send transactional email via Resend', inputSchema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, html: { type: 'string' } }, required: ['to','subject','html'] } },
          { name: 'metrics.traffic', description: 'Get traffic/weather metrics for a location', inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' } }, required: ['lat','lon'] } },
          { name: 'marketing.generate', description: 'Generate trainer marketing content', inputSchema: { type: 'object', properties: { trainerId: { type: 'string' }, specialties: { type: 'array', items: { type: 'string' } }, location: { type: 'string' }, targetAudience: { type: 'string' } }, required: ['trainerId'] } },
          { name: 'zapier.notify', description: 'Send an event to Zapier', inputSchema: { type: 'object', properties: { event: { type: 'string' }, payload: { type: 'object' } }, required: ['event'] } }
        ]
      };
    },
    async call(name, args) {
      switch (name) {
        case 'gia.chat': {
          const { message, userRole = 'CLIENT' } = args || {};
          const data = await callJSON('/api/gia', 'POST', { message, userRole });
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'trainers.search': {
          const { city, specialty } = args || {};
          const qs = new URLSearchParams();
          if (city) qs.set('city', city);
          if (specialty) qs.set('specialty', specialty);
          const data = await callJSON(`/api/public/trainers${qs.toString() ? `?${qs.toString()}` : ''}`, 'GET');
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'trainers.get': {
          const { trainerId } = args || {};
          const data = await callJSON(`/api/public/trainers/${encodeURIComponent(trainerId)}`, 'GET');
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'courts.search': {
          const { city, sport } = args || {};
          const qs = new URLSearchParams();
          if (city) qs.set('city', city);
          if (sport) qs.set('sport', sport);
          const data = await callJSON(`/api/public/facilities${qs.toString() ? `?${qs.toString()}` : ''}`, 'GET');
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'bookings.create': {
          const result = await callJSON('/api/public/bookings', 'POST', args);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'messages.send': {
          const result = await callJSON('/api/messages', 'POST', args);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'messages.list': {
          const { userId, otherUserId } = args || {};
          const qs = new URLSearchParams({ userId });
          if (otherUserId) qs.set('otherUserId', otherUserId);
          const data = await callJSON(`/api/messages?${qs.toString()}`, 'GET');
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'calendar.create': {
          const res = await callJSON('/api/google/calendar', 'POST', args);
          return { content: [{ type: 'text', text: JSON.stringify(res) }] };
        }
        case 'email.send': {
          const res = await callJSON('/api/subscription/resend-email', 'POST', { type: 'custom', data: args });
          return { content: [{ type: 'text', text: JSON.stringify(res) }] };
        }
        case 'metrics.traffic': {
          const { lat, lon } = args || {};
          const data = await callJSON(`/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`, 'GET');
          return { content: [{ type: 'text', text: JSON.stringify(data) }] };
        }
        case 'marketing.generate': {
          const result = await callJSON('/api/trainer/marketing-generate', 'POST', args);
          return { content: [{ type: 'text', text: JSON.stringify(result) }] };
        }
        case 'zapier.notify': {
          const res = await callJSON('/api/integrations/zapier/webhook', 'POST', { action: 'ping', data: args });
          return { content: [{ type: 'text', text: JSON.stringify(res) }] };
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }
  },
  resources: {
    async list() {
      return { resources: [
        { uri: 'goodrunss://docs/start', mimeType: 'text/markdown', name: 'Start Here' },
      ] };
    },
    async read(uri) {
      if (uri === 'goodrunss://docs/start') {
        const text = '# GoodRunss MCP\nUse tools: gia.chat, bookings.create, marketing.generate.';
        return { contents: [{ uri, mimeType: 'text/markdown', text }] };
      }
      throw new Error('Not found');
    }
  },
  prompts: {
    async list() {
      return { prompts: [
        { name: 'player.findCourt', description: 'Find a court', arguments: { type: 'object', properties: { query: { type: 'string' } } } },
        { name: 'trainer.promo', description: 'Generate trainer promo post', arguments: { type: 'object', properties: { trainerId: { type: 'string' } } } }
      ] };
    },
    async get(name) {
      switch (name) {
        case 'player.findCourt':
          return { prompt: { messages: [{ role: 'user', content: [{ type: 'text', text: 'Find me a court nearby' }] }] } };
        case 'trainer.promo':
          return { prompt: { messages: [{ role: 'user', content: [{ type: 'text', text: 'Generate a promo post' }] }] } };
        default:
          throw new Error('Unknown prompt');
      }
    }
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((e)=>{
  console.error('MCP server error', e);
  process.exit(1);
});
