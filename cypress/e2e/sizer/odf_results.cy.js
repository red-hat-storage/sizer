/// <reference types="cypress" />

Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

describe("Sizer create sharing link", () => {
  beforeEach(() => {
    cy.setCookie("SkipTour", "true");
    cy.visit("/#/storage");
  });

  it("simple ODF", () => {
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 20);
  });
  it("ODF m5.2xl", () => {
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.2xl");
    cy.contains("m5.2xlarge").parent().click();
    cy.get("footer").children().click();
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 10);
    cy.get('article > div:contains("odf-default")').should("have.length", 7);
  });
  it("ODF m5.4xl", () => {
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.4xl");
    cy.get('button:contains("m5.4xlarge")').parent().click();
    cy.get("footer").children().click();
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 6);
    cy.get('article > div:contains("odf-default")').should("have.length", 3);
  });
  it("ODF single disk with m5.4xl", () => {
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.4xl");
    cy.get('button:contains("m5.4xlarge")').parent().click();
    cy.get("footer").children().click();
    cy.get('input[name="diskSize"]').clear().click().type("5");
    cy.get('input[name="usableCapacity"]').clear().click().type("5");
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 6);
    cy.get(".results-general")
      .contains("Total cluster resource consumption is:")
      .find("ul")
      .children()
      .first()
      .should("contain.text", "30.25");
  });
  it("ODF double disk with m5.4xl", () => {
    cy.get('input[name="diskSize"]').clear().click().type("5");
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.4xl");
    cy.get('button:contains("m5.4xlarge")').parent().click();
    cy.get("footer").children().click();
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 6);
    cy.get(".results-general")
      .contains("Total cluster resource consumption is:")
      .find("ul")
      .children()
      .first()
      .should("contain.text", "36.25");
  });
  it("ODF triple disk with m5.4xl", () => {
    cy.get('input[name="diskSize"]').clear().click().type("5");
    cy.get('input[name="usableCapacity"]').clear().click().type("15");
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.4xl");
    cy.get('button:contains("m5.4xlarge")').parent().click();
    cy.get("footer").children().click();
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 6);
    cy.get(".results-general")
      .contains("Total cluster resource consumption is:")
      .find("ul")
      .children()
      .first()
      .should("contain.text", "42.25");
  });
  it("ODF quadruple disk with m5.4xl", () => {
    cy.get('input[name="diskSize"]').clear().click().type("5");
    cy.get('input[name="usableCapacity"]').clear().click().type("20");
    cy.get(".pf-c-check").first().find("input[type=checkbox]").check();
    cy.contains("Please select a Machine to dedicated for ODF.")
      .siblings()
      .first()
      .children()
      .click()
      .parent()
      .find("ul")
      .contains("Create custom MachineSet")
      .click();
    cy.get(".pf-c-select__toggle-typeahead").type("m5.4xl");
    cy.get('button:contains("m5.4xlarge")').parent().click();
    cy.get("footer").children().click();
    cy.get("#create-odf").click();
    cy.get(".pf-c-nav__link").last().should("have.text", "Results").click();
    cy.get("article").should("have.length", 6);
    cy.get(".results-general")
      .contains("Total cluster resource consumption is:")
      .find("ul")
      .children()
      .first()
      .should("contain.text", "48.25");
  });
});
