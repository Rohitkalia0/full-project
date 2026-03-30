import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./UserContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<UserProvider>
			<App/>
		</UserProvider>
	</BrowserRouter>
);
