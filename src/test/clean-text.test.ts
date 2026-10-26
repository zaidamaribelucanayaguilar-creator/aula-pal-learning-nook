import { describe, expect, it } from "vitest";
import { cleanImportedText, decodeHtmlEntities, stripWebJunk } from "@/lib/clean-text";

describe("decodeHtmlEntities", () => {
  it("convierte entidades numéricas comunes", () => {
    expect(decodeHtmlEntities("coraz&#243;n &#8211; m&#250;sculo")).toBe("corazón – músculo");
  });
  it("convierte entidades hexadecimales y con nombre", () => {
    expect(decodeHtmlEntities("&#x201C;Hola&#x201D; &ntilde; &iquest;Qu&eacute;?")).toBe("“Hola” ñ ¿Qué?");
  });
  it("deja intacto el texto sin entidades", () => {
    expect(decodeHtmlEntities("Texto normal con tildes: áéíóú")).toBe("Texto normal con tildes: áéíóú");
  });
});

describe("stripWebJunk", () => {
  it("elimina botones de compartir y copiar enlace", () => {
    const sucio = "El corazón bombea sangre.\nCompartir en Facebook\nCopiar enlace\nShare on Twitter";
    expect(stripWebJunk(sucio)).toBe("El corazón bombea sangre.");
  });
  it("elimina menús, cookies y pies de página", () => {
    const sucio = "Contenido educativo real sobre anatomía.\nInicio\nAceptar cookies\nTodos los derechos reservados 2026\nSuscríbete al newsletter";
    expect(stripWebJunk(sucio)).toBe("Contenido educativo real sobre anatomía.");
  });
  it("conserva párrafos educativos completos", () => {
    const texto = "La fotosíntesis usa luz solar.\nLas plantas producen glucosa y oxígeno.";
    expect(stripWebJunk(texto)).toBe(texto);
  });
  it("no borra una línea educativa que mencione compartir en redes", () => {
    const linea = "El corazón bombea sangre. Compartir en Facebook. Copiar enlace. Las aurículas reciben la sangre.";
    expect(stripWebJunk(linea)).toBe(linea);
  });
});

describe("cleanImportedText", () => {
  it("limpia entidades y basura web en un solo paso", () => {
    const sucio = "Anatom&#237;a del coraz&#243;n.\nCompartir en LinkedIn\n\n\n\nLas cavidades: aur&#237;culas y ventr&#237;culos.";
    expect(cleanImportedText(sucio)).toBe("Anatomía del corazón.\nLas cavidades: aurículas y ventrículos.");
  });
});
