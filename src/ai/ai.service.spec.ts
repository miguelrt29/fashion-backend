import { Test } from '@nestjs/testing';
import { AiService } from './ai.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { EmbeddingService } from './embedding.service';

describe('AiService - parseJsonResponse', () => {
  let aiService: AiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: ProductsService, useValue: { findAll: jest.fn().mockResolvedValue([]) } },
        { provide: EmbeddingService, useValue: { getImageEmbedding: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);
  });

  it('should parse valid JSON correctly', () => {
    const json = '{"text":"Hola","products":[{"id":"1","name":"Test","price":100,"category":"Cat","gender":"Unisex","images":["/uploads/test.jpg"],"sizes":[],"colors":[],"discount":0}]}';
    const result = (aiService as any).parseJsonResponse(json);
    
    expect(result.text).toBe('Hola');
    expect(result.products.length).toBe(1);
    expect(result.products[0].id).toBe('1');
  });

  it('should extract JSON from markdown', () => {
    const text = '```json\n{"text":"Hola","products":[]}\n```';
    const result = (aiService as any).parseJsonResponse(text);
    
    expect(result.text).toBe('Hola');
    expect(result.products).toEqual([]);
  });

  it('should extract JSON with extra text', () => {
    const text = 'Aquí tienes: {"text":"Productos","products":[]} Saludos';
    const result = (aiService as any).parseJsonResponse(text);
    
    expect(result.text).toBe('Productos');
    expect(result.products).toEqual([]);
  });

  it('should handle invalid JSON gracefully', () => {
    const text = 'Esto no es JSON ****';
    const result = (aiService as any).parseJsonResponse(text);
    
    expect(result.text).toBe('');
    expect(result.products).toEqual([]);
  });

  it('should return empty when text field is missing', () => {
    const json = '{"products":[{"id":"1"}]}';
    const result = (aiService as any).parseJsonResponse(json);
    
    expect(result.text).toBe('');
    expect(result.products.length).toBe(0);
  });
});

describe('AiService - normalizeImages', () => {
  let aiService: AiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: ProductsService, useValue: { findAll: jest.fn().mockResolvedValue([]) } },
        { provide: EmbeddingService, useValue: { getImageEmbedding: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);
  });

  it('should convert relative paths to absolute URLs', () => {
    const result = (aiService as any).normalizeImages(['/uploads/image.jpg', 'image2.png']);
    expect(result[0]).toContain('http://localhost:3000/uploads/image.jpg');
    expect(result[1]).toContain('http://localhost:3000/image2.png');
  });

  it('should keep absolute URLs as is', () => {
    const result = (aiService as any).normalizeImages(['https://example.com/image.jpg']);
    expect(result[0]).toBe('https://example.com/image.jpg');
  });

  it('should filter out empty strings', () => {
    const result = (aiService as any).normalizeImages(['', 'valid.jpg', null, undefined]);
    expect(result.length).toBe(1);
    expect(result[0]).toContain('valid.jpg');
  });
});
