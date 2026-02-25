import Header from "./components/Header";
import EventList from "./components/EventList";
import styles from "./App.module.css";

export default function App() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <EventList />
      </main>
    </>
  );
}
