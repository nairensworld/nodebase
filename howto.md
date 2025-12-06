# [ How TO ] 🚀

Step by step guide for development activities in this project


## [ Prisma ] 
Prisma is the ORM tool we used in this project to manage the connection with the DB.
It allows to manage the database changes using a code (prisma.schema)

- To apply the changes execute:
  ```bash 
  $ npx prisma migrate dev  
## [ Add New Node ] 🚀

1.  **Prisma Node Type:**  
    Add to NodeType enum the new type at schema.prisma  
    Execute:  
     $ npx prisma migrate dev

2.  **Copy and refactor executions or triggers folder:**  
    Copy and paste one of the existing executions/triggers folder:

    - `src\app\features\executions`
    - `src\app\features\triggers\components`
    - Refactor the Node files under the new folder

3.  **Channel:**  
    To follow the node status, create an Inngest channel

    - Copy and paste one of the exisiting channel files under: `src\inngest\channels`
    - Refactor the channel file for your new Node
    - Register the new channel in ([functions.ts](src\inngest\functions.ts))

4.  **Node Component Factory:**  
    Add the new node to the node component factory

    - Add the new NodeType to ([node-components.ts](src\app\features\executions\components\node-components.ts))

5.  **Node Selector:**  
    Add the new node to the node selector to allow the user to choose the new node.

    - Add the new Node Dialog to ([node-selector.tsx](src\components\node-selector.tsx))

6.  **Executer Registery:**  
    Add the new node to the executer register to allow executing the new node process.

    - Add the new Node executer to ([executor-registery.ts](src\app\features\executions\lib\executor-registery.ts))

## [ Stripe ] 🚀

Stripe is a widely used billing platform. events like payments or checkouts can be very usefull to trigger a workflow and process the event data.

1.  **Trigger stripe event:**

    - To trigger stripe event there's a stripe npm library to install and then it becomes a cli allows to execute stripe activities and listen to events.

    - To listen and trigger events do the following:
      - install stripe cli:
        ```bash
        $ npm i stripe
        ```
      - Add your webhook as a listener to stripe events:
        ```bash
        $ stripe listen --forward-to "http://localhost:3000/api/webhooks/stripe?workflowId=cmiotbbp100013xi8kh6xqupx"
        ```
      - Simualte a stripe event trigger:
        ```bash
        $  stripe trigger payment_intent.succeeded
        ```


