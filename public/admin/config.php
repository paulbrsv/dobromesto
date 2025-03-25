<?php
// Include authentication check
require_once 'includes/auth.php';

// Load config
$config = load_config();

// Include header
include 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h3>Configuration Editor</h3>
        <div class="form-check">
            <input type="checkbox" id="toggle-editor-mode" class="form-check-input">
            <label for="toggle-editor-mode" class="form-check-label">Advanced Mode (JSON Editor)</label>
        </div>
    </div>

    <div class="card-body">
        <div id="form-editor">
            <!-- Friendly editor interface -->

            <!-- Left Filters Section -->
            <div class="section">
                <h4>Left Filters</h4>
                <div id="left-filters-container">
                    <!-- This will be populated by JavaScript -->
                </div>
                <button id="add-left-filter" class="btn btn-sm btn-primary mt-2">
                    <i class="fas fa-plus"></i> Add Left Filter
                </button>
            </div>

            <hr>

            <!-- Right Filters Section -->
            <div class="section">
                <h4>Right Filters</h4>
                <div id="right-filters-container">
                    <!-- This will be populated by JavaScript -->
                </div>
                <button id="add-right-filter" class="btn btn-sm btn-primary mt-2">
                    <i class="fas fa-plus"></i> Add Right Filter
                </button>
            </div>

            <hr>

            <!-- Map Settings Section -->
            <div class="section">
                <h4>Map Settings</h4>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="map-center-lat">Map Center Latitude</label>
                            <input type="text" id="map-center-lat" class="form-control">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="map-center-lng">Map Center Longitude</label>
                            <input type="text" id="map-center-lng" class="form-control">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="map-initial-zoom">Initial Zoom Level</label>
                            <input type="number" id="map-initial-zoom" class="form-control" min="1" max="20">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="map-max-zoom">Maximum Zoom Level</label>
                            <input type="number" id="map-max-zoom" class="form-control" min="1" max="20">
                        </div>
                    </div>
                </div>
            </div>

            <hr>

            <!-- Content Settings Section -->
            <div class="section">
                <h4>Content Settings</h4>
                <div id="cities-container">
                    <h5>Cities</h5>
                    <!-- Cities will be populated by JavaScript -->
                </div>
                <button id="add-city" class="btn btn-sm btn-primary mt-2">
                    <i class="fas fa-plus"></i> Add City
                </button>

                <div class="mt-4">
                    <h5>Navigation Links</h5>
                    <div id="nav-links-container">
                        <!-- Nav links will be populated by JavaScript -->
                    </div>
                    <button id="add-nav-link" class="btn btn-sm btn-primary mt-2">
                        <i class="fas fa-plus"></i> Add Navigation Link
                    </button>
                </div>

                <div class="form-group mt-4">
                    <label for="footer-text">Footer Text</label>
                    <input type="text" id="footer-text" class="form-control">
                </div>
            </div>
        </div>

        <div id="json-editor" style="display: none;">
            <!-- JSON Editor -->
            <div class="form-group">
                <textarea id="config-json" class="json-editor" rows="20"><?php echo json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?></textarea>
            </div>
            <div class="json-validation-message"></div>
        </div>
    </div>

    <div class="card-footer">
        <button id="save-config" class="btn btn-primary">Save Configuration</button>
        <button id="reset-config" class="btn btn-light">Reset Changes</button>
    </div>
</div>

<!-- Filter Item Template -->
<template id="filter-item-template">
    <div class="filter-item card mb-2">
        <div class="card-body">
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>Key</label>
                        <input type="text" class="form-control filter-key" placeholder="filter_key">
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>Label</label>
                        <input type="text" class="form-control filter-label" placeholder="Filter Label">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>Tooltip</label>
                        <input type="text" class="form-control filter-tooltip" placeholder="Tooltip text">
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>Icon Path</label>
                        <input type="text" class="form-control filter-icon" placeholder="/data/images/icon.svg">
                    </div>
                </div>
            </div>
            <button class="btn btn-sm btn-danger remove-filter">Remove</button>
        </div>
    </div>
</template>

<!-- City Item Template -->
<template id="city-item-template">
    <div class="city-item card mb-2">
        <div class="card-body">
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>City Name</label>
                        <input type="text" class="form-control city-name" placeholder="City Name">
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-control city-disabled">
                            <option value="false">Enabled</option>
                            <option value="true">Disabled</option>
                        </select>
                    </div>
                </div>
            </div>
            <button class="btn btn-sm btn-danger remove-city">Remove</button>
        </div>
    </div>
</template>

<!-- Nav Link Item Template -->
<template id="nav-link-template">
    <div class="nav-link-item card mb-2">
        <div class="card-body">
            <div class="form-row">
                <div class="form-col">
                    <div class="form-group">
                        <label>Label</label>
                        <input type="text" class="form-control nav-link-label" placeholder="Link Label">
                    </div>
                </div>
                <div class="form-col">
                    <div class="form-group">
                        <label>URL</label>
                        <input type="text" class="form-control nav-link-href" placeholder="/page/">
                    </div>
                </div>
            </div>
            <button class="btn btn-sm btn-danger remove-nav-link">Remove</button>
        </div>
    </div>
</template>

<script>
// Global config object
let configData = <?php echo json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form with config data
    initializeForm();

    // Add event listener for editor mode toggle
    document.getElementById('toggle-editor-mode').addEventListener('change', function() {
        toggleEditorMode(this.checked);
    });

    // Add event listeners for buttons
    document.getElementById('add-left-filter').addEventListener('click', function() {
        addFilter('leftFilters');
    });

    document.getElementById('add-right-filter').addEventListener('click', function() {
        addFilter('rightFilters');
    });

    document.getElementById('add-city').addEventListener('click', function() {
        addCity();
    });

    document.getElementById('add-nav-link').addEventListener('click', function() {
        addNavLink();
    });

    document.getElementById('save-config').addEventListener('click', function() {
        saveConfig();
    });

    document.getElementById('reset-config').addEventListener('click', function() {
        resetConfig();
    });

    // Add event listener for JSON validation
    document.getElementById('config-json').addEventListener('input', function() {
        validateJSON(this.value);
    });
});

// Initialize form with config data
function initializeForm() {
    // Map Settings
    document.getElementById('map-center-lat').value = configData.mapSettings.center[0];
    document.getElementById('map-center-lng').value = configData.mapSettings.center[1];
    document.getElementById('map-initial-zoom').value = configData.mapSettings.initialZoom;
    document.getElementById('map-max-zoom').value = configData.mapSettings.maxZoom;

    // Footer Text
    document.getElementById('footer-text').value = configData.content.footerText;

    // Render filters
    renderFilters();

    // Render cities
    renderCities();

    // Render nav links
    renderNavLinks();
}

// Toggle between form editor and JSON editor
function toggleEditorMode(useJsonEditor) {
    if (useJsonEditor) {
        // Switch to JSON editor
        document.getElementById('form-editor').style.display = 'none';
        document.getElementById('json-editor').style.display = 'block';

        // Update JSON value from form
        updateJsonFromForm();
    } else {
        // Try to parse JSON and update form
        const jsonValue = document.getElementById('config-json').value;

        try {
            configData = JSON.parse(jsonValue);
            initializeForm();

            // Switch to form editor
            document.getElementById('form-editor').style.display = 'block';
            document.getElementById('json-editor').style.display = 'none';
        } catch (e) {
            // Alert user about invalid JSON
            Toast.show('Cannot switch to form view: Invalid JSON', 'error');

            // Keep JSON editor open
            document.getElementById('toggle-editor-mode').checked = true;
        }
    }
}

// Render filters
function renderFilters() {
    const leftFiltersContainer = document.getElementById('left-filters-container');
    const rightFiltersContainer = document.getElementById('right-filters-container');

    // Clear containers
    leftFiltersContainer.innerHTML = '';
    rightFiltersContainer.innerHTML = '';

    // Render left filters
    configData.filters.leftFilters.forEach((filter, index) => {
        const filterElement = createFilterElement(filter, 'leftFilters', index);
        leftFiltersContainer.appendChild(filterElement);
    });

    // Render right filters
    configData.filters.rightFilters.forEach((filter, index) => {
        const filterElement = createFilterElement(filter, 'rightFilters', index);
        rightFiltersContainer.appendChild(filterElement);
    });
}

// Create filter element
function createFilterElement(filter, type, index) {
    const template = document.getElementById('filter-item-template');
    const filterElement = document.importNode(template.content, true).querySelector('.filter-item');

    // Set data attributes for identifying the filter
    filterElement.setAttribute('data-type', type);
    filterElement.setAttribute('data-index', index);

    // Fill filter data
    filterElement.querySelector('.filter-key').value = filter.key;
    filterElement.querySelector('.filter-label').value = filter.label;
    filterElement.querySelector('.filter-tooltip').value = filter.tooltip;
    filterElement.querySelector('.filter-icon').value = filter.icon;

    // Add event listener for remove button
    filterElement.querySelector('.remove-filter').addEventListener('click', function() {
        removeFilter(filterElement);
    });

    return filterElement;
}

// Add a new filter
function addFilter(type) {
    // Create a new empty filter
    const newFilter = {
        key: '',
        label: '',
        tooltip: '',
        icon: ''
    };

    // Add to config data
    configData.filters[type].push(newFilter);

    // Create element
    const container = document.getElementById(`${type === 'leftFilters' ? 'left' : 'right'}-filters-container`);
    const filterElement = createFilterElement(newFilter, type, configData.filters[type].length - 1);

    // Append to container
    container.appendChild(filterElement);
}

// Remove a filter
function removeFilter(filterElement) {
    const type = filterElement.getAttribute('data-type');
    const index = parseInt(filterElement.getAttribute('data-index'));

    // Remove from config data
    configData.filters[type].splice(index, 1);

    // Remove element
    filterElement.remove();

    // Re-render filters to update indices
    renderFilters();
}

// Render cities
function renderCities() {
    const citiesContainer = document.getElementById('cities-container');

    // Clear container except heading
    const heading = citiesContainer.querySelector('h5');
    citiesContainer.innerHTML = '';
    citiesContainer.appendChild(heading);

    // Render cities
    configData.content.cities.forEach((city, index) => {
        const cityElement = createCityElement(city, index);
        citiesContainer.appendChild(cityElement);
    });
}

// Create city element
function createCityElement(city, index) {
    const template = document.getElementById('city-item-template');
    const cityElement = document.importNode(template.content, true).querySelector('.city-item');

    // Set data attribute for identifying the city
    cityElement.setAttribute('data-index', index);

    // Fill city data
    cityElement.querySelector('.city-name').value = city.name;
    cityElement.querySelector('.city-disabled').value = city.disabled.toString();

    // Add event listener for remove button
    cityElement.querySelector('.remove-city').addEventListener('click', function() {
        removeCity(cityElement);
    });

    return cityElement;
}

// Add a new city
function addCity() {
    // Create a new empty city
    const newCity = {
        name: '',
        disabled: false
    };

    // Add to config data
    configData.content.cities.push(newCity);

    // Create element
    const container = document.getElementById('cities-container');
    const cityElement = createCityElement(newCity, configData.content.cities.length - 1);

    // Append to container
    container.appendChild(cityElement);
}

// Remove a city
function removeCity(cityElement) {
    const index = parseInt(cityElement.getAttribute('data-index'));

    // Remove from config data
    configData.content.cities.splice(index, 1);

    // Remove element
    cityElement.remove();

    // Re-render cities to update indices
    renderCities();
}

// Render navigation links
function renderNavLinks() {
    const navLinksContainer = document.getElementById('nav-links-container');

    // Clear container
    navLinksContainer.innerHTML = '';

    // Render nav links
    configData.content.navLinks.forEach((link, index) => {
        const linkElement = createNavLinkElement(link, index);
        navLinksContainer.appendChild(linkElement);
    });
}

// Create navigation link element
function createNavLinkElement(link, index) {
    const template = document.getElementById('nav-link-template');
    const linkElement = document.importNode(template.content, true).querySelector('.nav-link-item');

    // Set data attribute for identifying the link
    linkElement.setAttribute('data-index', index);

    // Fill link data
    linkElement.querySelector('.nav-link-label').value = link.label;
    linkElement.querySelector('.nav-link-href').value = link.href;

    // Add event listener for remove button
    linkElement.querySelector('.remove-nav-link').addEventListener('click', function() {
        removeNavLink(linkElement);
    });

    return linkElement;
}

// Add a new navigation link
function addNavLink() {
    // Create a new empty link
    const newLink = {
        label: '',
        href: ''
    };

    // Add to config data
    configData.content.navLinks.push(newLink);

    // Create element
    const container = document.getElementById('nav-links-container');
    const linkElement = createNavLinkElement(newLink, configData.content.navLinks.length - 1);

    // Append to container
    container.appendChild(linkElement);
}

// Remove a navigation link
function removeNavLink(linkElement) {
    const index = parseInt(linkElement.getAttribute('data-index'));

    // Remove from config data
    configData.content.navLinks.splice(index, 1);

    // Remove element
    linkElement.remove();

    // Re-render nav links to update indices
    renderNavLinks();
}

// Update JSON from form values
function updateJsonFromForm() {
    // Update map settings
    configData.mapSettings.center[0] = parseFloat(document.getElementById('map-center-lat').value);
    configData.mapSettings.center[1] = parseFloat(document.getElementById('map-center-lng').value);
    configData.mapSettings.initialZoom = parseInt(document.getElementById('map-initial-zoom').value);
    configData.mapSettings.maxZoom = parseInt(document.getElementById('map-max-zoom').value);

    // Update footer text
    configData.content.footerText = document.getElementById('footer-text').value;

    // Update left filters
    const leftFiltersElements = document.querySelectorAll('#left-filters-container .filter-item');
    configData.filters.leftFilters = Array.from(leftFiltersElements).map(el => ({
        key: el.querySelector('.filter-key').value,
        label: el.querySelector('.filter-label').value,
        tooltip: el.querySelector('.filter-tooltip').value,
        icon: el.querySelector('.filter-icon').value
    }));

    // Update right filters
    const rightFiltersElements = document.querySelectorAll('#right-filters-container .filter-item');
    configData.filters.rightFilters = Array.from(rightFiltersElements).map(el => ({
        key: el.querySelector('.filter-key').value,
        label: el.querySelector('.filter-label').value,
        tooltip: el.querySelector('.filter-tooltip').value,
        icon: el.querySelector('.filter-icon').value
    }));

    // Update cities
    const citiesElements = document.querySelectorAll('#cities-container .city-item');
    configData.content.cities = Array.from(citiesElements).map(el => ({
        name: el.querySelector('.city-name').value,
        disabled: el.querySelector('.city-disabled').value === 'true'
    }));

    // Update nav links
    const navLinksElements = document.querySelectorAll('#nav-links-container .nav-link-item');
    configData.content.navLinks = Array.from(navLinksElements).map(el => ({
        label: el.querySelector('.nav-link-label').value,
        href: el.querySelector('.nav-link-href').value
    }));

    // Update JSON textarea
    document.getElementById('config-json').value = JSON.stringify(configData, null, 2);
}

// Validate JSON
function validateJSON(json) {
    const validationMessage = document.querySelector('.json-validation-message');

    try {
        JSON.parse(json);
        validationMessage.textContent = 'JSON is valid';
        validationMessage.style.color = 'green';
        return true;
    } catch (e) {
        validationMessage.textContent = 'Invalid JSON: ' + e.message;
        validationMessage.style.color = 'red';
        return false;
    }
}

// Save configuration
function saveConfig() {
    // Check if we're in JSON editor mode
    const isJsonMode = document.getElementById('toggle-editor-mode').checked;

    if (isJsonMode) {
        // Get JSON from textarea
        const jsonValue = document.getElementById('config-json').value;

        // Validate JSON
        if (!validateJSON(jsonValue)) {
            Toast.show('Cannot save: Invalid JSON', 'error');
            return;
        }

        // Parse JSON
        configData = JSON.parse(jsonValue);
    } else {
        // Update config data from form
        updateJsonFromForm();
    }

    // Send data to server
    fetch('api/save_config.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Toast.show(data.message, 'success');
        } else {
            Toast.show(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Toast.show('An error occurred while saving the configuration', 'error');
    });
}

// Reset configuration
function resetConfig() {
    // Confirm reset
    confirmModal('Are you sure you want to reset all changes?', () => {
        // Reload the page to reset form
        window.location.reload();
    });
}
</script>

<?php
// Include footer
include 'includes/footer.php';
?>
