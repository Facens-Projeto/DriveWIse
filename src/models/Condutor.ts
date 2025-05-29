export class Condutor {
  constructor(
    public estilo: string,
    public ruas: string,
    public frequencia: string,
    public estado: string,
    public cidade: string
  ) {}

  toJSON() {
    return {
      estilo: this.estilo,
      ruas: this.ruas,
      frequencia: this.frequencia,
      estado: this.estado,
      cidade: this.cidade,
    };
  }
}
