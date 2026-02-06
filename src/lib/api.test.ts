import { expect, test } from "bun:test";
import { careerlyApi } from "./api";

test("profiles flow", async () => {
    // Create
    await careerlyApi.db.profiles.create({ name: "Alice", userId: "u1" });

    // Exists
    const exists = await careerlyApi.db.profiles.exists({ where: { userId: "u1" } });
    expect(exists).toBe(true);

    // List
    const list = await careerlyApi.db.profiles.list({ where: { userId: "u1" } });
    expect(list.length).toBeGreaterThanOrEqual(1);
    const profile = list.find((p: any) => p.name === "Alice");
    expect(profile).toBeDefined();
});

test("internships flow", async () => {
    // Create
    await careerlyApi.db.internships.create({ title: "Intern", userId: "u2" });

    // Count
    const count = await careerlyApi.db.internships.count({ where: { userId: "u2" } });
    expect(count).toBe(1);

    // List
    const list = await careerlyApi.db.internships.list({ where: { userId: "u2" } });
    expect(list.length).toBe(1);
    const id = list[0].id;

    // Delete
    await careerlyApi.db.internships.delete(id);
    const countAfter = await careerlyApi.db.internships.count({ where: { userId: "u2" } });
    expect(countAfter).toBe(0);
});

test("roadmaps flow", async () => {
    // Upsert (insert)
    await careerlyApi.db.roadmaps.upsert({ userId: "u3", type: "backend", steps: [] });

    // List
    const list = await careerlyApi.db.roadmaps.list({ where: { userId: "u3" } });
    expect(list.length).toBe(1);
    expect(list[0].type).toBe("backend");

    // Upsert (update)
    await careerlyApi.db.roadmaps.upsert({ userId: "u3", type: "backend", steps: ["step1"] });
    const listAfter = await careerlyApi.db.roadmaps.list({ where: { userId: "u3" } });
    expect(listAfter.length).toBe(1);
    expect(listAfter[0].steps).toEqual(["step1"]);
});
