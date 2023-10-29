import { test, expect } from '@playwright/test';
import BrokerPage from '../pages/brokerPage';

test.setTimeout(300000);

test('Search and Validate All Brokers on Yavlena Page', async ({ page }) => {
    const brokerPage = new BrokerPage(page);

    await brokerPage.navigateToYavlenaBrokerPage();

    await brokerPage.loadAllBrokers();

    const brokerNames = await brokerPage.getBrokerNames();
    // Perform search and validation for each broker
    await brokerPage.searchAndAssertBrokers(brokerNames);

    await page.close();
});
