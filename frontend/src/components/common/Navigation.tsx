import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

export function Navigation() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.brand}>
        <h1>LlamaIndex RAG</h1>
      </div>
      <ul className={styles.navList}>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            aria-label="Dashboard"
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/vaults"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            aria-label="Vault Management"
          >
            Vaults
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/documents"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            aria-label="Document Upload"
          >
            Documents
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/agents"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            aria-label="Agent Management"
          >
            Agents
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/chat"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            aria-label="Chat Console"
          >
            Chat
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
