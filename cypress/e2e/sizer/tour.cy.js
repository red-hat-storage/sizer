/// <reference types="cypress" />

Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

describe("Sizer create sharing link", () => {
  beforeEach(() => {
    //   cy.setCookie("SkipTour", "true");
    cy.visit("/");
  });

  it("do tour", () => {
    cy.get(".shepherd-button").last().should("have.text", "Next").click();
  });
});
