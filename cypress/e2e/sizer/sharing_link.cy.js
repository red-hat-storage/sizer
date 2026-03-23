/// <reference types="cypress" />

describe("Sizer create sharing link", () => {
  beforeEach(() => {
    cy.setCookie("SkipTour", "true");
    cy.visit("/#/results");
  });

  it("no config", () => {
    cy.get("#sharing-link").click();
    cy.get(".pf-c-clipboard-copy__group > input")
      .should("contain.value", "?state=")
      .invoke("val")
      .should("have.length.above", 20);
  });

  it("default ODF", () => {
    cy.contains("Create default ODF Cluster(10 TB)").click();

    cy.get("#sharing-link").click();
    cy.get(".pf-c-clipboard-copy__group > input")
      .should("contain.value", "?state=")
      .invoke("val")
      .should("have.length.above", 20);
  });
});
