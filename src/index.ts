import { start_server } from "./api";
import { WRITE_SECRET, RBLX_SERVER_SECRET } from "./constants/Secrets";

// Verify config is correct
if (!WRITE_SECRET) {
    console.warn("You're missing the field: RBLX_SERVER_SECRET")
}

if (!RBLX_SERVER_SECRET) {
    console.warn("You're missing the field: RBLX_SERVER_SECRET")
}

if (!RBLX_SERVER_SECRET || !WRITE_SECRET) {
    console.log("Due to missing the above fields, the server cannot start.")
    process.exit();
}

start_server();
