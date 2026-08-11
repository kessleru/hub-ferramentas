import { describe, expect, it } from 'vitest'

import { contemDadoPessoal, pareceCpf, pareceListaDePessoas } from '@/lib/dadoPessoal'

/**
 * §11 — o defeito mais provável deste módulo **não** é deixar passar um CPF: é
 * o falso positivo, que bloqueia quem só queria relatar um defeito. Metade
 * destes testes existe para isso.
 */

describe('pareceCpf', () => {
  it('pega CPF pontuado', () => {
    expect(pareceCpf('o CPF dela é 529.982.247-25 e não gera')).toBe(true)
  })

  it('pega CPF sem pontuação', () => {
    expect(pareceCpf('mandei 52998224725 e deu erro')).toBe(true)
  })

  it('não pega telefone celular com DDD', () => {
    expect(pareceCpf('meu telefone é 11987654321 se precisar')).toBe(false)
    expect(pareceCpf('me liga em (11) 98765-4321')).toBe(false)
  })

  it('não pega CEP', () => {
    expect(pareceCpf('o endereço é 13560-970')).toBe(false)
  })

  it('não pega número de processo', () => {
    expect(pareceCpf('processo 0001234-56.2026.8.26.0100')).toBe(false)
  })

  it('não pega data', () => {
    expect(pareceCpf('aconteceu em 11/08/2026 às 14:30')).toBe(false)
    expect(pareceCpf('na turma de 2026-08-11')).toBe(false)
  })

  it('não pega uma sequência de dígitos iguais', () => {
    expect(pareceCpf('digitei 00000000000 para testar')).toBe(false)
  })
})

describe('pareceListaDePessoas', () => {
  it('pega três linhas no formato "número. NOME" em caixa alta', () => {
    const texto = ['1. MARIA DA SILVA', '2. JOÃO PEREIRA SANTOS', '3. ANA SOUZA'].join('\n')
    expect(pareceListaDePessoas(texto)).toBe(true)
  })

  it('pega a mesma lista em caixa mista', () => {
    const texto = ['1. Maria da Silva', '2. João Pereira', '3. Ana Souza'].join('\n')
    expect(pareceListaDePessoas(texto)).toBe(true)
  })

  it('não pega passos numerados, que é o que o §6.2 pede que a pessoa escreva', () => {
    const texto = [
      '1. Abri o gerador',
      '2. Colei a lista da turma',
      '3. Cliquei em gerar e não aconteceu nada',
    ].join('\n')
    expect(pareceListaDePessoas(texto)).toBe(false)
  })

  it('não pega passos curtos que começam com verbo em maiúscula', () => {
    const texto = ['1. Gerar Certificado', '2. Abrir Documento', '3. Fechar Word'].join('\n')
    expect(pareceListaDePessoas(texto)).toBe(false)
  })

  it('não pega duas pessoas — o limite do §6.5 é três', () => {
    expect(pareceListaDePessoas('1. MARIA DA SILVA\n2. JOÃO PEREIRA')).toBe(false)
  })
})

describe('contemDadoPessoal', () => {
  it('devolve o motivo, para a tela poder explicar qual é o problema', () => {
    expect(contemDadoPessoal('529.982.247-25')).toEqual({ encontrou: true, motivo: 'cpf' })
    expect(contemDadoPessoal('1. MARIA SILVA\n2. JOÃO SOUZA\n3. ANA LIMA')).toEqual({
      encontrou: true,
      motivo: 'lista',
    })
  })

  it('deixa passar um relato de defeito comum', () => {
    const relato =
      'Abri o gerador no Firefox, subi o modelo .docx e cliquei em gerar. ' +
      'Esperava baixar o .zip, mas a tela ficou parada no passo 3. ' +
      'Aconteceu em 11/08/2026, por volta das 14h. Meu ramal é 4321.'
    expect(contemDadoPessoal(relato)).toEqual({ encontrou: false })
  })
})
