/**
 * conector.css - Estilos específicos para páginas de conector de Mini-IA
 */

/* Breadcrumb */
.breadcrumb {
    background-color: var(--color-white);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-gray-light);
}

.breadcrumb ul {
    display: flex;
    list-style: none;
    align-items: center;
    flex-wrap: wrap;
}

.breadcrumb li {
    font-size: 0.875rem;
    color: var(--color-gray);
}

.breadcrumb li a {
    color: var(--color-gray-dark);
    text-decoration: none;
}

.breadcrumb li a:hover {
    color: var(--color-primary);
}

.breadcrumb li:not(:last-child)::after {
    content: '/';
    margin: 0 0.5rem;
    color: var(--color-gray-light);
}

/* Header da Mini-IA */
.miniai-header {
    background-color: var(--color-white);
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--color-gray-light);
}

.miniai-header-content {
    display: flex;
    gap: var(--space-4);
    align-items: center;
}

.miniai-header-info {
    flex: 1;
}

.miniai-header h1 {
    margin-bottom: var(--space-1);
    font-size: 2rem;
}

.miniai-header-description {
    color: var(--color-gray-dark);
    margin-bottom: var(--space-2);
    font-size: 1.125rem;
}

.miniai-header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
}

.miniai-header-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.miniai-header-rating .stars {
    display: flex;
}

.miniai-header-rating span {
    color: var(--color-gray);
    font-size: 0.875rem;
}

.miniai-header-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.miniai-header-tags .tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background-color: var(--color-primary-light);
    color: var(--color-primary);
}

.miniai-header-tags .tag.crm {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
}

.miniai-header-tags .tag.email {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
}

.miniai-header-tags .tag.payments {
    background-color: var(--color-secondary-light);
    color: var(--color-secondary);
}

.miniai-header-image {
    width: 180px;
    height: 180px;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-md);
}

.miniai-header-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Layout Principal */
.conector-main {
    padding: var(--space-4) 0 var(--space-6);
}

.conector-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: var(--space-4);
}

/* Abas */
.conector-tabs {
    display: flex;
    border-bottom: 1px solid var(--color-gray-light);
    margin-bottom: var(--space-3);
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
}

.conector-tabs::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
}

.conector-tab {
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: 500;
    color: var(--color-gray);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.conector-tab:hover {
    color: var(--color-primary);
}

.conector-tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
}

/* Conteúdo das Abas */
.conector-tab-content {
    display: none;
}

.conector-tab-content.active {
    display: block;
}

.conector-section {
    margin-bottom: var(--space-4);
}

.conector-section:last-child {
    margin-bottom: 0;
}

.conector-section h2 {
    font-size: 1.5rem;
    margin-bottom: var(--space-2);
}

.conector-section p {
    color: var(--color-gray-dark);
    line-height: 1.6;
}

/* Casos de Uso */
.use-cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-2);
}

.use-case-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    padding: var(--space-2);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-gray-light);
}

.use-case-icon {
    width: 48px;
    height: 48px;
    background-color: var(--color-primary-light);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-1);
    color: var(--color-primary);
}

.use-case-card h3 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
}

.use-case-card p {
    font-size: 0.875rem;
    color: var(--color-gray);
}

/* Lista de Recursos */
.features-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-2);
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    padding: var(--space-1) 0;
}

.feature-icon {
    color: var(--color-secondary);
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feature-text {
    flex: 1;
}

.feature-text h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.feature-text p {
    font-size: 0.875rem;
    color: var(--color-gray);
}

/* Integrações */
.integrations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-2);
}

.integration-item {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-light);
    padding: var(--space-1);
    text-align: center;
    transition: all var(--transition-fast);
}

.integration-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.integration-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-1);
}

.integration-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.integration-name {
    font-size: 0.875rem;
    font-weight: 500;
}

/* Requisitos e Permissões */
.requirements-list {
    padding-left: var(--space-3);
}

.requirements-list li {
    margin-bottom: 0.5rem;
    color: var(--color-gray-dark);
}

.permissions-list {
    margin-top: var(--space-2);
}

.permission-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-1);
    margin-bottom: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-gray-light);
}

.permission-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.permission-icon {
    width: 24px;
    height: 24px;
    color: var(--color-primary);
    flex-shrink: 0;
}

.permission-content {
    flex: 1;
}

.permission-content h4 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.permission-content p {
    font-size: 0.875rem;
    color: var(--color-gray);
}

/* Avaliações */
.reviews-summary {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-3);
    background-color: var(--color-light);
    padding: var(--space-3);
    border-radius: var(--border-radius);
}

.reviews-average {
    text-align: center;
    min-width: 150px;
}

.reviews-average-number {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-dark);
    line-height: 1;
}

.reviews-average-stars {
    margin: 0.5rem 0;
}

.reviews-count {
    font-size: 0.875rem;
    color: var(--color-gray);
}

.reviews-breakdown {
    flex: 1;
}

.rating-bar {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: 0.5rem;
}

.rating-label {
    min-width: 30px;
    font-size: 0.875rem;
    text-align: right;
}

.rating-progress {
    flex: 1;
    height: 10px;
    background-color: var(--color-gray-light);
    border-radius: 5px;
    overflow: hidden;
}

.rating-progress-fill {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 5px;
}

.rating-percent {
    min-width: 40px;
    font-size: 0.875rem;
    color: var(--color-gray);
}

.reviews-list {
    margin-top: var(--space-3);
}

.review-item {
    border-bottom: 1px solid var(--color-gray-light);
    padding-bottom: var(--space-3);
    margin-bottom: var(--space-3);
}

.review-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.review-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-1);
}

.review-author {
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.review-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-gray-light);
    overflow: hidden;
}

.review-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.review-author-info h4 {
    font-size: 1rem;
    margin-bottom: 0;
}

.review-date {
    font-size: 0.875rem;
    color: var(--color-gray);
}

.review-rating {
    display: flex;
    align-items: center;
}

.review-content {
    margin-top: var(--space-1);
}

.review-text {
    margin-bottom: var(--space-1);
}

/* Cartão de Instalação */
.installation-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-gray-light);
}

.installation-header {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-gray-light);
}

.installation-header h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.installation-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-secondary);
}

.installation-price-period {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-gray);
}

.installation-body {
    padding: var(--space-2);
}

.required-services {
    margin: var(--space-2) 0;
}

.required-service {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: var(--space-1);
    padding: var(--space-1);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-light);
    transition: all var(--transition-fast);
}

.required-service:hover {
    background-color: var(--color-light);
}

.required-service.connected {
    border-color: var(--color-secondary-light);
    background-color: var(--color-secondary-light);
}

.required-service-icon {
    width: 24px;
    height: 24px;
}

.required-service-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.required-service-info {
    flex: 1;
}

.required-service-name {
    font-size: 0.875rem;
    font-weight: 500;
}

.required-service-status {
    font-size: 0.75rem;
    color: var(--color-gray);
}

.required-service.connected .required-service-status {
    color: var(--color-secondary);
}

.required-service-action {
    white-space: nowrap;
}

.installation-actions {
    margin-top: var(--space-2);
}

.btn-block {
    width: 100%;
    justify-content: center;
}

.installation-note {
    text-align: center;
    margin-top: var(--space-1);
    color: var(--color-gray);
}

/* Cartão do Desenvolvedor */
.developer-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    padding: var(--space-2);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-gray-light);
}

.developer-info {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: var(--space-1);
}

.developer-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.developer-info h4 {
    font-size: 0.75rem;
    color: var(--color-gray);
    margin-bottom: 0;
}

.developer-info h3 {
    font-size: 1rem;
    margin-bottom: 0;
}

.developer-card > p {
    font-size: 0.875rem;
    color: var(--color-gray-dark);
    margin-bottom: var(--space-2);
}

.developer-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-2);
}

.developer-stat {
    text-align: center;
}

.developer-stat-value {
    font-size: 1.125rem;
    font-weight: 700;
}

.developer-stat-label {
    font-size: 0.75rem;
    color: var(--color-gray);
}

/* Cartão de Suporte */
.support-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    padding: var(--space-2);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-gray-light);
}

.support-card h3 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
}

.support-card p {
    font-size: 0.875rem;
    color: var(--color-gray-dark);
    margin-bottom: var(--space-2);
}

/* Mini-IAs Relacionadas */
.related-miniais {
    background-color: var(--color-light);
    padding: var(--space-4) 0;
}

.related-miniais h2 {
    margin-bottom: var(--space-3);
}

.related-miniais-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-3);
}

/* Modal de Instalação */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    z-index: var(--z-index-modal);
}

.modal.active {
    display: flex;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-2);
}

.modal-content {
    background-color: var(--color-white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1;
}

.modal-header {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-gray-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.25rem;
    margin-bottom: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: background-color var(--transition-fast);
}

.modal-close:hover {
    background-color: var(--color-light);
}

.modal-body {
    padding: var(--space-2);
}

/* Passos de Instalação */
.installation-steps {
    position: relative;
}

.installation-step {
    display: none;
}

.installation-step.active {
    display: block;
}

.installation-step h3 {
    font-size: 1.25rem;
    margin-bottom: var(--space-1);
}

.installation-step p {
    color: var(--color-gray-dark);
    margin-bottom: var(--space-2);
}

.services-list {
    margin: var(--space-2) 0;
}

.service-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: var(--space-1);
    padding: var(--space-1);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-gray-light);
    transition: all var(--transition-fast);
}

.service-item.connected {
    border-color: var(--color-secondary-light);
    background-color: var(--color-secondary-light);
}

.service-icon {
    width: 32px;
    height: 32px;
}

.service-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.service-info {
    flex: 1;
}

.service-name {
    font-size: 0.875rem;
    font-weight: 500;
}

.service-description {
    font-size: 0.75rem;
    color: var(--color-gray);
}

.service-item.connected .service-status {
    color: var(--color-secondary);
}

.service-action {
    white-space: nowrap;
}

.settings-form {
    margin: var(--space-2) 0;
}

.form-group {
    margin-bottom: var(--space-2);
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.confirmation-details {
    background-color: var(--color-light);
    border-radius: var(--border-radius);
    padding: var(--space-2);
    margin: var(--space-2) 0;
}

.confirmation-section {
    margin-bottom: var(--space-2);
}

.confirmation-section:last-child {
    margin-bottom: 0;
}

.confirmation-section h4 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--color-gray-dark);
}

.confirmation-list {
    list-style: none;
}

.confirmation-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-gray-light);
    font-size: 0.875rem;
}

.confirmation-list li:last-child {
    border-bottom: none;
}

.confirmation-list-label {
    color: var(--color-gray);
}

.step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-3);
}

/* Animação de Sucesso */
.success-animation {
    width: 100px;
    height: 100px;
    margin: var(--space-3) auto;
}

.checkmark {
    width: 100px;
    height: 100px;
}

.checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    stroke: var(--color-secondary);
    fill: none;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke: var(--color-secondary);
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
    100% {
        stroke-dashoffset: 0;
    }
}

/* Responsividade */
@media (max-width: 991px) {
    .conector-grid {
        grid-template-columns: 1fr;
    }
    
    .miniai-header-content {
        flex-direction: column;
    }
    
    .miniai-header-image {
        width: 100%;
        max-width: 220px;
        height: auto;
        aspect-ratio: 1;
        margin: 0 auto;
    }
}

@media (max-width: 767px) {
    .conector-tabs {
        flex-wrap: nowrap;
    }
    
    .use-cases-grid,
    .features-list,
    .related-miniais-grid {
        grid-template-columns: 1fr;
    }
    
    .integrations-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
    
    .reviews-summary {
        flex-direction: column;
    }
    
    .modal-content {
        max-height: 95vh;
    }
}

@media (max-width: 575px) {
    .step-actions {
        flex-direction: column;
        gap: var(--space-1);
    }
    
    .step-actions button,
    .step-actions a {
        width: 100%;
    }
}
