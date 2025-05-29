export class Veiculo {
  constructor(
    public marca: string,
    public modelo: string,
    public ano: number,
    public quilometragem: number,
    public combustiveisAceitos: string[],
    public modificacoes?: string
  ) {}

  toJSON() {
    return {
      marca: this.marca,
      modelo: this.modelo,
      ano: this.ano,
      quilometragem: this.quilometragem,
      combustiveisAceitos: this.combustiveisAceitos,
      modificacoes: this.modificacoes,
    };
  }
}
