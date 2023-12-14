//
// Tabs
//

import { Tab } from 'bootstrap';

const tabsTriggerList = document.querySelectorAll('[data-theme-toggle="tab"]');

tabsTriggerList.forEach(tabTriggerEl => {
    tabTriggerEl.addEventListener('click', e => {
        e.preventDefault();
        alert("Aca");
        new Tab(document.querySelector(tabTriggerEl.hash)).show();
    });
});