import { expect } from '@playwright/test';
import { Page } from 'playwright';

const yavlenaURL = 'https://www.yavlena.com/broker/';
const loadMoreButton = '.load-more-results-list';
const brokerCard = '.broker-card';
const brokerName = 'h3.name > a';
const searchBox = '.field.search-field >> #searchBox';
const brokerAddress = '.office';
const brokerNumberOfProperties = '.position > a';
const brokerDivTel = '.tel-group';
const brokerPhoneNumbers = 'span.tel';

export default class BrokerPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async waitOneSecond(): Promise<void> {
        await this.page.waitForTimeout(1500);
    }

    public async waitFiveSeconds(): Promise<void> {
        await this.page.waitForTimeout(5000);
    }

    public async navigateToYavlenaBrokerPage(): Promise<void> {
        await this.page.goto(yavlenaURL);
        await this.waitFiveSeconds();
    }

    public async loadAllBrokers(): Promise<void> {
        await this.page.locator(loadMoreButton).click();
        await this.waitFiveSeconds();
    }

    /**
     * getBrokerNames(), this method retrieves the names of brokers from the broker list on the page.
     *
     * 1. It first waits for the broker list to be available on the page.
     * 2. It then locates the broker cards within that list.
     * 3. It initializes an empty array called `brokerNames` to store the names of brokers.
     * 4. It iterates through each broker card to find the broker names.
     * 5. Within each broker card, it may find multiple names and iterates through them.
     * 6. It checks if the title attribute is not null or empty before adding it to the `brokerNames` array.
     * returns {Promise<string[]>} - A promise that resolves to an array of broker names.
     */
    public async getBrokerNames(): Promise<string[]> {
        await this.page.waitForSelector(brokerCard);
        const brokerCards = this.page.locator(brokerCard);
        const count = await brokerCards.count();
        const brokerNames: string[] = [];

        for (let brokerCardIndex = 0; brokerCardIndex < count; brokerCardIndex++) {
            const aCount = await brokerCards.nth(brokerCardIndex).locator(brokerName).count();
            for (let brokerNameIndex = 0; brokerNameIndex < aCount; brokerNameIndex++) {
                const title = await brokerCards
                    .nth(brokerCardIndex)
                    .locator(brokerName)
                    .nth(brokerNameIndex)
                    .getAttribute('title');
                if (title !== null && title !== '') {
                    brokerNames.push(title);
                }
            }
        }

        return brokerNames;
    }

    public async searchBrokerByName(name: string): Promise<void> {
        // Find the search input field and type the broker name
        await this.page.fill(searchBox, name);
    }

    /**
     * searchAndAssertBrokers(), this method performs a search for each broker by name and validates the information displayed.
     *
     * 1. Iterates through the list of broker names provided as an argument.
     * 2. For each broker name, it performs a search using the `searchBrokerByName` method.
     * 3. Waits for a short period (1 second) to allow the page to load.
     * 4. Locates the broker cards and counts them, expecting only one card to be present.
     * 5. Validates the displayed broker name against the searched broker name.
     * 6. Validates that the address of the broker is displayed and is not null.
     * 7. Validates that the number of properties associated with the broker is displayed and is not null.
     * 8. Validates that exactly two phone numbers are displayed for the broker.
     *
     * param {string[]} brokerNames - An array of broker names to search and validate.
     * returns {Promise<void>} - A promise that resolves when all validations are complete.
     */

    public async searchAndAssertBrokers(brokerNames: string[]): Promise<void> {
        for (let brokerNameIndex = 0; brokerNameIndex < brokerNames.length; brokerNameIndex++) {
            // console.log(`Starting iteration for broker ${brokerNames[brokerNameIndex]}`);
            try {
                // Search for the broker by name
                await this.searchBrokerByName(brokerNames[brokerNameIndex]);
                // console.log(`Searched for broker ${brokerNames[brokerNameIndex]}`);
                await this.waitOneSecond();

                const brokerCards = this.page.locator(brokerCard);
                const cardCount = await brokerCards.count();
                expect(cardCount).toBe(1);

                const displayedName = await this.page.locator(brokerName).textContent();
                expect(displayedName).toBe(brokerNames[brokerNameIndex]);

                const address = await this.page.locator(brokerAddress).textContent();
                expect(address).not.toBeNull();

                const numberOfProperties = await this.page.locator(brokerNumberOfProperties).textContent();
                expect(numberOfProperties).not.toBeNull();

                const phoneNumbers = this.page.locator(brokerDivTel).locator(brokerPhoneNumbers);
                const phoneCount = await phoneNumbers.count();
                expect(phoneCount).toBe(2);
            } catch (e) {
                console.error(`Error in iteration for broker ${brokerNames[brokerNameIndex]}: ${e}`);
                throw new Error(`Exception thrown while processing broker ${brokerNames[brokerNameIndex]}: ${e}`);
            }
            // console.log(`Ending iteration for broker ${brokerNames[brokerNameIndex]}`);
        }
    }
}